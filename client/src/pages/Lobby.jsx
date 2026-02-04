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

    const newSocket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
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
    if (message.trim() && socket && user) {
      socket.emit('chat:send', { roomId, userId: user.id, message });
      setMessage('');
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(roomId);
    alert('Invite code copied!');
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
        <div className="card mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Game Lobby</h1>
            {room.isPrivate && (
              <button onClick={copyInviteCode} className="btn-secondary">
                Copy Invite Code
              </button>
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
              <button onClick={handleReady} className="btn-primary flex-1">
                Ready
              </button>
              {user && room.hostId === user.id && players.length >= 2 && (
                <button onClick={handleStart} className="btn-primary flex-1">
                  Start Game
                </button>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Chat</h2>
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
                placeholder="Type a message..."
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
