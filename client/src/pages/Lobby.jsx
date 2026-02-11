import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { io } from 'socket.io-client';

export default function Lobby() {
  const { roomId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

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
      console.log('✅ Connected to lobby');
      newSocket.emit('room:join', { roomId, user });
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
    });

    newSocket.on('room:update', (data) => {
      setRoom(data.room);
      setPlayers(data.players);
    });

    newSocket.on('game:start', (data) => {
      navigate(`/game/${data.gameId}`);
    });

    newSocket.on('chat:message', (data) => {
      setChatMessages(prev => [...prev, data]);
    });

    return () => newSocket.close();
  }, [roomId, user, navigate]);

  const handleReady = () => {
    if (socket && user) {
      socket.emit('player:ready', { roomId, userId: user.id });
    }
  };

  const handleStart = () => {
    if (socket) {
      socket.emit('game:start', { roomId });
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket) return;
    
    // Check if user is registered (has a real account, not guest)
    if (!user || user.isGuest || !user.id || user.id.startsWith('guest_')) {
      alert('⚠️ Chat is only available for registered users. Please sign up or log in to use chat.');
      return;
    }
    
    socket.emit('chat:send', { roomId, userId: user.id, message });
    setMessage('');
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(roomId);
    // Show visual feedback
    const button = document.getElementById('copy-invite-btn');
    if (button) {
      const originalText = button.textContent;
      button.textContent = '✓ Copied!';
      button.classList.add('bg-green-500');
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('bg-green-500');
      }, 2000);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Redirecting to login...</div>
      </div>
    );
  }

  if (!room) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Invite Code */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-3xl font-bold mb-2">Game Lobby</h1>
                <p className="text-gray-600">Waiting for players to join...</p>
              </div>
            </div>
            {room.isPrivate && (
              <div className="w-full md:w-auto">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🔑 Share this invite code with friends:
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 md:w-64 px-4 py-3 bg-blue-50 border-2 border-blue-300 rounded-lg font-mono text-lg font-bold text-center text-blue-700">
                    {roomId}
                  </div>
                  <button 
                    id="copy-invite-btn"
                    onClick={copyInviteCode} 
                    className="btn-primary whitespace-nowrap transition-all duration-300"
                  >
                    📋 Copy Code
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Friends can join by clicking "Join Room" on the dashboard and pasting this code
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 card">
            <h2 className="text-2xl font-bold mb-4">Players ({players.length}/4)</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[0, 1, 2, 3].map((index) => {
                const player = players[index];
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      player ? 'border-primary bg-blue-50' : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    {player ? (
                      <div className="flex items-center space-x-3">
                        <img
                          src={player.avatar || '/default-avatar.png'}
                          alt={player.username}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <div className="font-bold">{player.username}</div>
                          <div className="text-sm text-gray-600">
                            {player.isReady ? '✅ Ready' : '⏳ Not Ready'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400">Waiting for player...</div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex space-x-4">
              <button 
                onClick={handleReady} 
                className={`btn-primary flex-1 ${
                  user && players.find(p => p.id === user.id)?.isReady 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : ''
                }`}
              >
                {user && players.find(p => p.id === user.id)?.isReady ? '✓ Ready!' : 'Ready'}
              </button>
              {user && room.hostId === user.id && players.length >= 2 && (
                <button 
                  onClick={handleStart} 
                  className="btn-primary flex-1 bg-green-500 hover:bg-green-600"
                  disabled={players.filter(p => p.isReady).length < 2}
                >
                  Start Game ({players.filter(p => p.isReady).length}/{players.length} ready)
                </button>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Chat</h2>
            
            {/* Chat restriction notice for guests */}
            {(!user || user.isGuest || user.id?.startsWith('guest_')) && (
              <div className="mb-3 p-2 bg-yellow-50 border border-yellow-300 rounded-lg text-xs text-yellow-800">
                🔒 Chat is only available for registered users. <a href="/register" className="underline font-semibold">Sign up</a> or <a href="/login" className="underline font-semibold">log in</a> to chat.
              </div>
            )}
            
            <div className="h-64 overflow-y-auto mb-4 space-y-2">
              {chatMessages.map((msg, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded">
                  <span className="font-bold">{msg.username}: </span>
                  <span>{msg.message}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={user && !user.isGuest && !user.id?.startsWith('guest_') ? "Type a message..." : "Login to chat..."}
                disabled={!user || user.isGuest || user.id?.startsWith('guest_')}
                className="input-field flex-1 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button 
                type="submit" 
                className="btn-primary disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={!user || user.isGuest || user.id?.startsWith('guest_')}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
