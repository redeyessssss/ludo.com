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

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const newSocket = io(API_URL, {
      transports: ['polling', 'websocket'], // Try polling first to avoid ad blocker issues
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
      upgrade: true, // Allow upgrade to WebSocket if available
    });
    
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Connected to server');
      setConnectionStatus('connected');
      newSocket.emit('user:online', user);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      console.log('💡 Tip: Disable ad blockers or browser extensions that might block connections');
      console.log('🔧 Using HTTP polling as fallback...');
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
      console.log('Waiting for match:', data);
      setQueuePosition(data.totalInQueue);
    });
    
    newSocket.on('matchmaking:found', (data) => {
      console.log('Match found!', data);
      setSearching(false);
      navigate(`/lobby/${data.roomId}`);
    });

    return () => newSocket.close();
  }, [user, navigate]);

  const handleQuickPlay = () => {
    if (socket && user && !searching) {
      setSearching(true);
      setSearchMode('Quick Play');
      setQueuePosition(1);
      
      // Get user's region (you can use a geolocation API in production)
      const region = Intl.DateTimeFormat().resolvedOptions().timeZone || 'global';
      
      socket.emit('matchmaking:join', { 
        userId: user.id, 
        mode: 'quick',
        region: region
      });
    }
  };

  const handleRankedPlay = () => {
    if (socket && user && !searching) {
      setSearching(true);
      setSearchMode('Ranked');
      setQueuePosition(1);
      
      const region = Intl.DateTimeFormat().resolvedOptions().timeZone || 'global';
      
      socket.emit('matchmaking:join', { 
        userId: user.id, 
        mode: 'ranked',
        region: region
      });
    }
  };

  const handleCreatePrivate = () => {
    if (socket && user) {
      socket.emit('room:create', { userId: user.id, isPrivate: true });
      socket.on('room:created', (data) => {
        navigate(`/lobby/${data.roomId}`);
      });
    }
  };

  const cancelSearch = () => {
    if (socket && user) {
      socket.emit('matchmaking:cancel', { 
        userId: user.id, 
        mode: searchMode.toLowerCase().replace(' ', '')
      });
    }
    setSearching(false);
    setSearchMode('');
    setQueuePosition(0);
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Connection Status Banner */}
        {connectionStatus !== 'connected' && (
          <div className={`mb-4 p-4 rounded-lg ${
            connectionStatus === 'error' ? 'bg-red-100 border-2 border-red-500' : 'bg-yellow-100 border-2 border-yellow-500'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {connectionStatus === 'connecting' && (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                    <span className="font-semibold text-yellow-800">Connecting to server...</span>
                  </>
                )}
                {connectionStatus === 'error' && (
                  <>
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="font-semibold text-red-800">Connection blocked</p>
                      <p className="text-sm text-red-700">Please disable ad blockers or browser extensions blocking WebSocket connections</p>
                    </div>
                  </>
                )}
                {connectionStatus === 'disconnected' && (
                  <>
                    <span className="text-2xl">🔌</span>
                    <span className="font-semibold text-yellow-800">Disconnected - Reconnecting...</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Searching Modal */}
        {searching && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="card max-w-md w-full text-center">
              <div className="text-6xl mb-4 animate-bounce">🌍</div>
              <h2 className="text-2xl font-bold mb-2">Searching Globally...</h2>
              <p className="text-gray-600 mb-2">Finding opponents worldwide</p>
              <p className="text-primary font-bold mb-4">{queuePosition} player(s) in queue</p>
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-gray-700">
                  🎮 Mode: <span className="font-bold">{searchMode}</span>
                </p>
                <p className="text-sm text-gray-700">
                  🌐 Searching: <span className="font-bold">Global</span>
                </p>
              </div>
              <button onClick={cancelSearch} className="btn-secondary w-full">
                Cancel Search
              </button>
            </div>
          </div>
        )}

        <div className="card mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome, {user.username}!</h1>
              <div className="flex items-center space-x-4">
                <p className="text-gray-600">🟢 {onlinePlayers} players online globally</p>
                {playersInQueue.quick > 0 && (
                  <p className="text-sm text-blue-600">⚡ {playersInQueue.quick} in Quick Play queue</p>
                )}
                {playersInQueue.ranked > 0 && (
                  <p className="text-sm text-purple-600">🏆 {playersInQueue.ranked} in Ranked queue</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{user.rating || 1000}</div>
              <div className="text-sm text-gray-600">Rating</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button onClick={handleQuickPlay} className="card hover:shadow-2xl transition-all cursor-pointer">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-2xl font-bold mb-2">Quick Play</h3>
            <p className="text-gray-600">Match with players globally</p>
            {playersInQueue.quick > 0 && (
              <p className="text-sm text-blue-600 mt-2 font-semibold">
                {playersInQueue.quick} player(s) searching now!
              </p>
            )}
          </button>

          <button onClick={handleRankedPlay} className="card hover:shadow-2xl transition-all cursor-pointer">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold mb-2">Ranked</h3>
            <p className="text-gray-600">Compete globally for rating</p>
            {playersInQueue.ranked > 0 && (
              <p className="text-sm text-purple-600 mt-2 font-semibold">
                {playersInQueue.ranked} player(s) searching now!
              </p>
            )}
          </button>

          <button onClick={handleCreatePrivate} className="card hover:shadow-2xl transition-all cursor-pointer">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold mb-2">Private Room</h3>
            <p className="text-gray-600">Play with friends</p>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Your Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Games Played:</span>
                <span className="font-bold">{user.gamesPlayed || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Wins:</span>
                <span className="font-bold text-green-600">{user.wins || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Win Rate:</span>
                <span className="font-bold">
                  {user.gamesPlayed ? ((user.wins / user.gamesPlayed) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Level:</span>
                <span className="font-bold">{user.level || 1}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-4">Daily Missions</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span>Play 3 games</span>
                <span className="text-sm text-gray-600">0/3</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span>Win 1 game</span>
                <span className="text-sm text-gray-600">0/1</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span>Capture 5 tokens</span>
                <span className="text-sm text-gray-600">0/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
