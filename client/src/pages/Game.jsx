import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import { io } from 'socket.io-client';
import LudoBoard from '../game/LudoBoard';

export default function Game() {
  const { gameId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const { gameState, setGameState, diceValue, setDiceValue } = useGameStore();
  const [rolling, setRolling] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.emit('game:join', { gameId, userId: user.id });

    newSocket.on('game:state', (data) => {
      setGameState(data);
    });

    newSocket.on('game:update', (data) => {
      setGameState(data.gameState);
      if (data.diceValue) {
        setDiceValue(data.diceValue);
      }
    });

    newSocket.on('game:end', (data) => {
      setTimeout(() => {
        alert(`Game Over! Winner: ${data.winner.username}`);
        navigate('/dashboard');
      }, 2000);
    });

    newSocket.on('chat:message', (data) => {
      setChatMessages(prev => [...prev, data]);
    });

    return () => newSocket.close();
  }, [gameId, user, navigate, setGameState, setDiceValue]);

  const handleRollDice = () => {
    if (rolling || !isMyTurn() || !socket || !user) return;
    
    setRolling(true);
    socket.emit('game:rollDice', { gameId, userId: user.id });
    
    setTimeout(() => setRolling(false), 1000);
  };

  const handleTokenClick = (tokenId) => {
    if (!isMyTurn() || !diceValue || !socket || !user) return;
    
    socket.emit('game:moveToken', { gameId, userId: user.id, tokenId });
  };

  const isMyTurn = () => {
    return user && gameState?.currentPlayer?.id === user.id;
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && socket && user) {
      socket.emit('chat:send', { gameId, userId: user.id, message });
      setMessage('');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Redirecting to login...</div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Players Info */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Players</h2>
              {gameState.players?.map((player, index) => (
                <div
                  key={`${player.id}-${index}`}
                  className={`p-3 mb-2 rounded-lg ${
                    gameState.currentPlayer?.id === player.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: ['red', 'blue', 'green', 'yellow'][index],
                      }}
                    />
                    <span className="font-bold">{player.username}</span>
                  </div>
                  {gameState.currentPlayer?.id === player.id && (
                    <div className="text-sm mt-1">🎯 Current Turn</div>
                  )}
                </div>
              ))}
            </div>

            {/* Dice */}
            <div className="card text-center">
              <h3 className="text-lg font-bold mb-4">Dice</h3>
              <div className="mb-4">
                <div className="text-6xl mx-auto w-20 h-20 flex items-center justify-center bg-white border-4 border-gray-800 rounded-lg shadow-lg">
                  {diceValue || '?'}
                </div>
              </div>
              <button
                onClick={handleRollDice}
                disabled={!isMyTurn() || rolling || diceValue}
                className={`btn-primary w-full ${
                  !isMyTurn() || rolling || diceValue ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {rolling ? 'Rolling...' : 'Roll Dice'}
              </button>
              {!isMyTurn() && (
                <p className="text-sm text-gray-600 mt-2">Waiting for other player...</p>
              )}
            </div>
          </div>

          {/* Game Board */}
          <div className="lg:col-span-2">
            <div className="card">
              <LudoBoard
                gameState={gameState}
                onTokenClick={handleTokenClick}
                onDiceRoll={handleRollDice}
                currentUserId={user.id}
              />
            </div>
          </div>

          {/* Chat */}
          <div className="lg:col-span-1">
            <div className="card h-full flex flex-col">
              <h2 className="text-xl font-bold mb-4">Chat</h2>
              <div className="flex-1 overflow-y-auto mb-4 space-y-2 max-h-96">
                {chatMessages.map((msg, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded">
                    <span className="font-bold text-sm">{msg.username}: </span>
                    <span className="text-sm">{msg.message}</span>
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
    </div>
  );
}
