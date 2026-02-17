import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { io } from 'socket.io-client';

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [onlinePlayers, setOnlinePlayers] = useState(0);
  const [playersInQueue, setPlayersInQueue] = useState({ quick: 0, ranked: 0 });
  const [searching, setSearching] = useState(false);
  const [searchMode, setSearchMode] = useState('');
  const [queuePosition, setQueuePosition] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [showBotModal, setShowBotModal] = useState(false);
  const [selectedPlayerCount, setSelectedPlayerCount] = useState(2);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const newSocket = io(API_URL, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
      upgrade: true,
    });
    
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Connected to server');
      setConnectionStatus('connected');
      newSocket.emit('user:online', user);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      setConnectionStatus('error');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      setConnectionStatus('disconnected');
    });
    
    newSocket.on('stats:update', (data) => {
      setOnlinePlayers(data.onlinePlayers);
      if (data.playersInQueue) {
        setPlayersInQueue(data.playersInQueue);
      }
    });
    
    newSocket.on('matchmaking:waiting', (data) => {
      setQueuePosition(data.totalInQueue);
    });
    
    newSocket.on('matchmaking:found', (data) => {
      setSearching(false);
      navigate(`/lobby/${data.roomId}`);
    });

    newSocket.on('bot:gameCreated', (data) => {
      navigate(`/game/${data.gameId}`);
    });

    return () => newSocket.close();
  }, [user, navigate]);

  const handleQuickPlay = () => {
    if (socket && user && !searching) {
      setSearching(true);
      setSearchMode('Quick Play');
      setQueuePosition(1);
      const region = Intl.DateTimeFormat().resolvedOptions().timeZone || 'global';
      socket.emit('matchmaking:join', { userId: user.id, mode: 'quick', region });
    }
  };

  const handleRankedPlay = () => {
    if (socket && user && !searching) {
      setSearching(true);
      setSearchMode('Ranked');
      setQueuePosition(1);
      const region = Intl.DateTimeFormat().resolvedOptions().timeZone || 'global';
      socket.emit('matchmaking:join', { userId: user.id, mode: 'ranked', region });
    }
  };

  const handleCreatePrivate = () => {
    if (socket && user) {
      socket.emit('room:create', { userId: user.id, isPrivate: true });
      socket.on('room:created', (data) => navigate(`/lobby/${data.roomId}`));
    }
  };

  const handleJoinPrivate = () => setShowJoinModal(true);

  const joinRoomWithCode = () => {
    if (inviteCode.trim() && socket && user) {
      navigate(`/lobby/${inviteCode.trim()}`);
      setShowJoinModal(false);
      setInviteCode('');
    }
  };

  const cancelSearch = () => {
    if (socket && user) {
      socket.emit('matchmaking:cancel', { userId: user.id, mode: searchMode.toLowerCase().replace(' ', '') });
    }
    setSearching(false);
    setSearchMode('');
    setQueuePosition(0);
  };

  const handleBotPlay = () => setShowBotModal(true);

  const startBotGame = () => {
    if (socket && user) {
      socket.emit('bot:createGame', { userId: user.id, playerCount: selectedPlayerCount });
      setShowBotModal(false);
    }
  };

  const winRate = user.gamesPlayed ? ((user.wins / user.gamesPlayed) * 100).toFixed(1) : 0;
  const level = user.level || 1;
  const xpProgress = ((user.rating || 1000) % 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Connection Status Banner */}
          {connectionStatus !== 'connected' && (
            <div className={`mb-6 p-4 rounded-2xl backdrop-blur-lg ${
              connectionStatus === 'error' 
                ? 'bg-red-500/20 border-2 border-red-500/50' 
                : 'bg-yellow-500/20 border-2 border-yellow-500/50'
            } animate-fade-in-up`}>
              <div className="flex items-center space-x-3">
                {connectionStatus === 'connecting' && (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-300"></div>
                    <span className="font-semibold text-yellow-100">Connecting to server...</span>
                  </>
                )}
                {connectionStatus === 'error' && (
                  <>
                    <span className="text-2xl">⚠️</span>
                    <span className="font-semibold text-red-100">Connection blocked - Check your network</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Hero Section */}
          <div className="mb-8 animate-fade-in-up">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold text-white mb-1">
                        Welcome back, {user.username}!
                      </h1>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="px-3 py-1 bg-green-500/30 text-green-100 rounded-full flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                          {onlinePlayers} online
                        </span>
                        {playersInQueue.quick > 0 && (
                          <span className="px-3 py-1 bg-blue-500/30 text-blue-100 rounded-full">
                            ⚡ {playersInQueue.quick} in queue
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* XP Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-white/80 mb-2">
                      <span>Level {level}</span>
                      <span>{xpProgress}% to next level</span>
                    </div>
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${xpProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="text-3xl font-bold text-yellow-400">{user.rating || 1000}</div>
                    <div className="text-xs text-white/70 mt-1">Rating</div>
                  </div>
                  <div className="text-center bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="text-3xl font-bold text-green-400">{user.wins || 0}</div>
                    <div className="text-xs text-white/70 mt-1">Wins</div>
                  </div>
                  <div className="text-center bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="text-3xl font-bold text-blue-400">{winRate}%</div>
                    <div className="text-xs text-white/70 mt-1">Win Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Game Modes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Quick Play */}
            <button 
              onClick={handleQuickPlay}
              className="group relative bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-3xl p-6 border border-white/20 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 animate-fade-in-up"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">⚡</div>
              <h3 className="text-2xl font-bold text-white mb-2">Quick Play</h3>
              <p className="text-white/70 text-sm mb-3">Jump into action instantly</p>
              {playersInQueue.quick > 0 && (
                <div className="absolute top-4 right-4 px-2 py-1 bg-cyan-500 text-white text-xs rounded-full animate-pulse">
                  {playersInQueue.quick} 🔥
                </div>
              )}
              <div className="mt-4 flex items-center text-cyan-400 text-sm font-semibold">
                Play Now <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>

            {/* Ranked */}
            <button 
              onClick={handleRankedPlay}
              className="group relative bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-3xl p-6 border border-white/20 hover:border-pink-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/50 animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🏆</div>
              <h3 className="text-2xl font-bold text-white mb-2">Ranked</h3>
              <p className="text-white/70 text-sm mb-3">Climb the leaderboard</p>
              {playersInQueue.ranked > 0 && (
                <div className="absolute top-4 right-4 px-2 py-1 bg-pink-500 text-white text-xs rounded-full animate-pulse">
                  {playersInQueue.ranked} 🔥
                </div>
              )}
              <div className="mt-4 flex items-center text-pink-400 text-sm font-semibold">
                Compete <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>

            {/* Play with Bot */}
            <button 
              onClick={handleBotPlay}
              className="group relative bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-3xl p-6 border border-white/20 hover:border-emerald-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/50 animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🤖</div>
              <h3 className="text-2xl font-bold text-white mb-2">VS Bot</h3>
              <p className="text-white/70 text-sm mb-3">Practice your skills</p>
              <div className="mt-4 flex items-center text-emerald-400 text-sm font-semibold">
                Train <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>

            {/* Private Room */}
            <button 
              onClick={handleCreatePrivate}
              className="group relative bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-lg rounded-3xl p-6 border border-white/20 hover:border-orange-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/50 animate-fade-in-up"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🔒</div>
              <h3 className="text-2xl font-bold text-white mb-2">Private</h3>
              <p className="text-white/70 text-sm mb-3">Play with friends</p>
              <div className="mt-4 flex items-center text-orange-400 text-sm font-semibold">
                Create <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button 
              onClick={handleJoinPrivate}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 text-left animate-fade-in-up"
              style={{ animationDelay: '0.5s' }}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🔑</div>
                <div>
                  <h3 className="text-xl font-bold text-white">Join Room</h3>
                  <p className="text-white/60 text-sm">Enter invite code</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => navigate('/leaderboard')}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 text-left animate-fade-in-up"
              style={{ animationDelay: '0.6s' }}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">📊</div>
                <div>
                  <h3 className="text-xl font-bold text-white">Leaderboard</h3>
                  <p className="text-white/60 text-sm">Top players</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => navigate(`/profile/${user.id}`)}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 text-left animate-fade-in-up"
              style={{ animationDelay: '0.7s' }}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">👤</div>
                <div>
                  <h3 className="text-xl font-bold text-white">Profile</h3>
                  <p className="text-white/60 text-sm">View stats</p>
                </div>
              </div>
            </button>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Achievements */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span>🎯</span> Daily Missions
              </h3>
              <div className="space-y-3">
                <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-semibold">Play 3 games</span>
                    <span className="text-white/60 text-sm">0/3</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-semibold">Win 1 game</span>
                    <span className="text-white/60 text-sm">0/1</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-semibold">Capture 5 tokens</span>
                    <span className="text-white/60 text-sm">0/5</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span>📈</span> Your Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Games Played</span>
                  <span className="text-2xl font-bold text-white">{user.gamesPlayed || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Total Wins</span>
                  <span className="text-2xl font-bold text-green-400">{user.wins || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Total Losses</span>
                  <span className="text-2xl font-bold text-red-400">{user.losses || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Tokens Captured</span>
                  <span className="text-2xl font-bold text-yellow-400">{user.tokensCaptured || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Current Level</span>
                  <span className="text-2xl font-bold text-purple-400">{level}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals remain the same */}
      {searching && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full mx-4 border border-white/20 shadow-2xl">
            <div className="text-6xl mb-4 animate-bounce text-center">🌍</div>
            <h2 className="text-3xl font-bold text-white mb-2 text-center">Searching...</h2>
            <p className="text-white/70 mb-4 text-center">Finding opponents worldwide</p>
            <div className="bg-white/10 rounded-2xl p-4 mb-6 text-center">
              <p className="text-white/80 mb-2">Mode: <span className="font-bold text-white">{searchMode}</span></p>
              <p className="text-2xl font-bold text-cyan-400">{queuePosition} in queue</p>
            </div>
            <button onClick={cancelSearch} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all">
              Cancel Search
            </button>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full mx-4 border border-white/20 shadow-2xl">
            <div className="text-5xl mb-4 text-center">🔑</div>
            <h2 className="text-3xl font-bold text-white mb-2 text-center">Join Private Room</h2>
            <p className="text-white/70 mb-6 text-center">Enter the invite code</p>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && joinRoomWithCode()}
              placeholder="Enter code..."
              className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 mb-6 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setShowJoinModal(false)} className="flex-1 bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-xl transition-all">
                Cancel
              </button>
              <button onClick={joinRoomWithCode} disabled={!inviteCode.trim()} className="flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-500 text-white font-bold py-3 rounded-xl transition-all">
                Join
              </button>
            </div>
          </div>
        </div>
      )}

      {showBotModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full mx-4 border border-white/20 shadow-2xl">
            <div className="text-5xl mb-4 text-center">🤖</div>
            <h2 className="text-3xl font-bold text-white mb-2 text-center">Play with Bot</h2>
            <p className="text-white/70 mb-6 text-center">Select number of players</p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[2, 3, 4].map((count) => (
                <button
                  key={count}
                  onClick={() => setSelectedPlayerCount(count)}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    selectedPlayerCount === count
                      ? 'border-cyan-400 bg-cyan-500/30 scale-105'
                      : 'border-white/30 bg-white/10 hover:border-white/50'
                  }`}
                >
                  <div className="text-4xl font-bold text-white mb-1">{count}</div>
                  <div className="text-xs text-white/70">{count === 2 ? '1 Bot' : count === 3 ? '2 Bots' : '3 Bots'}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-white/60 mb-6 text-center">You'll be Red and go first</p>
            <div className="flex gap-3">
              <button onClick={() => setShowBotModal(false)} className="flex-1 bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-xl transition-all">
                Cancel
              </button>
              <button onClick={startBotGame} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all">
                Start Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
