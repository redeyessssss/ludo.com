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
  const [showDiceAnimation, setShowDiceAnimation] = useState(false);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

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
      console.log('✅ Connected to game');
      newSocket.emit('game:join', { gameId, userId: user.id });
    });

    newSocket.on('game:state', (data) => {
      setGameState(data);
    });

    newSocket.on('game:update', (data) => {
      setGameState(data.gameState);
      if (data.diceValue) {
        setDiceValue(data.diceValue);
        setShowDiceAnimation(true);
        setTimeout(() => setShowDiceAnimation(false), 1000);
      }
    });

    newSocket.on('game:end', (data) => {
      setWinner(data.winner);
      setShowWinAnimation(true);
      setTimeout(() => {
        alert(`🎉 ${data.winner.username} won the game!`);
        navigate('/dashboard');
      }, 2000);
    });

    newSocket.on('chat:message', (data) => {
      setChatMessages(prev => [...prev, data]);
    });

    return () => newSocket.close();
  }, [user, navigate, setGameState, setDiceValue]);

  const handleRollDice = () => {
    if (rolling || !socket || gameState?.currentPlayer?.id !== user.id) return;
    
    setRolling(true);
    setShowDiceAnimation(true);
    
    socket.emit('game:rollDice', { gameId, userId: user.id });
    
    setTimeout(() => setRolling(false), 1000);
  };

  const handleTokenClick = (tokenId) => {
    if (!socket || gameState?.currentPlayer?.id !== user.id) return;
    socket.emit('game:moveToken', { gameId, userId: user.id, tokenId });
  };

  const handleSendMessage = () => {
    if (!message.trim() || !socket) return;
    socket.emit('chat:send', { gameId, userId: user.id, message });
    setMessage('');
  };

  const isCurrentPlayer = gameState?.currentPlayer?.id === user.id;
  const playerColor = gameState?.tokens?.[user.id]?.color || 'red';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-6 mb-4 md:mb-6 animate-fade-in-up">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-1 md:mb-2 flex flex-wrap items-center gap-2">
              🎲 Ludo Game
              {isCurrentPlayer && <span className="text-xl md:text-2xl animate-pulse">🎯 Your Turn!</span>}
            </h1>
            <p className="text-sm md:text-base text-blue-200">Current Player: <span className="font-bold text-white">{gameState?.currentPlayer?.username}</span></p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 md:px-6 py-2 md:py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 text-sm md:text-base w-full sm:w-auto"
          >
            ← Back
          </button>
        </div>

        {/* Main Game Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Game Board - Takes 3 columns on desktop, full width on mobile */}
          <div className="lg:col-span-3 w-full">
            <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 animate-scale-in">
              {/* Dice Section */}
              <div className="mb-6 md:mb-8 text-center">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">🎲 Roll the Dice</h2>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-3 md:gap-4 mb-4 md:mb-6">
                  {/* Dice Display */}
                  <div
                    className={`w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-2xl shadow-2xl flex items-center justify-center text-4xl md:text-6xl font-bold text-white cursor-pointer transition-all duration-300 ${
                      showDiceAnimation ? 'animate-dice-roll' : ''
                    } ${isCurrentPlayer ? 'hover:scale-110 hover:shadow-3xl' : 'opacity-50'}`}
                    onClick={handleRollDice}
                  >
                    {diceValue || '?'}
                  </div>

                  {/* Roll Button */}
                  <button
                    onClick={handleRollDice}
                    disabled={rolling || !isCurrentPlayer}
                    className={`px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all duration-300 transform w-full sm:w-auto ${
                      isCurrentPlayer && !rolling
                        ? 'bg-gradient-to-r from-green-400 to-green-600 text-white hover:scale-105 active:scale-95 shadow-lg hover:shadow-2xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {rolling ? '🎲 Rolling...' : '🎲 Roll Dice'}
                  </button>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 md:p-4 text-left text-sm md:text-base">
                  <p className="text-gray-700 font-semibold mb-2">📋 How to Play:</p>
                  <ul className="text-xs md:text-sm text-gray-600 space-y-1">
                    <li>✓ Click "Roll Dice" when it's your turn</li>
                    <li>✓ Click on your tokens to move them</li>
                    <li>✓ Reach the center to win!</li>
                    <li>✓ Safe spots (⭐) protect your tokens</li>
                  </ul>
                </div>
              </div>

              {/* Game Board */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-2 md:p-4 shadow-inner">
                <LudoBoard
                  gameState={gameState}
                  onTokenClick={handleTokenClick}
                  onDiceRoll={handleRollDice}
                  currentUserId={user.id}
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar - Players & Chat */}
          <div className="lg:col-span-1 space-y-4 md:space-y-6 w-full">
            {/* Players Info */}
            <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 animate-slide-in-right">
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4 flex items-center">
                👥 Players
              </h3>
              <div className="space-y-2 md:space-y-3">
                {gameState?.players?.map((player) => (
                  <div
                    key={player.id}
                    className={`p-2 md:p-3 rounded-lg transition-all duration-300 ${
                      gameState?.currentPlayer?.id === player.id
                        ? 'bg-yellow-100 border-2 border-yellow-400 scale-105'
                        : 'bg-gray-100 border-2 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 md:w-4 md:h-4 rounded-full"
                        style={{
                          background: gameState?.tokens?.[player.id]?.color
                            ? `linear-gradient(135deg, ${
                                {
                                  red: '#ef4444',
                                  blue: '#3b82f6',
                                  green: '#22c55e',
                                  yellow: '#eab308',
                                }[gameState.tokens[player.id].color]
                              } 0%, ${
                                {
                                  red: '#dc2626',
                                  blue: '#2563eb',
                                  green: '#16a34a',
                                  yellow: '#ca8a04',
                                }[gameState.tokens[player.id].color]
                              } 100%)`
                            : '#ccc',
                        }}
                      />
                      <span className="font-semibold text-gray-800 text-sm md:text-base truncate">{player.username}</span>
                      {gameState?.currentPlayer?.id === player.id && (
                        <span className="ml-auto text-lg animate-bounce">🎯</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat */}
            <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 flex flex-col h-64 md:h-80 animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">💬 Chat</h3>
              <div className="flex-1 overflow-y-auto mb-3 md:mb-4 space-y-2 bg-gray-50 rounded-lg p-2 md:p-3">
                {chatMessages.length === 0 ? (
                  <p className="text-gray-400 text-xs md:text-sm text-center py-8">No messages yet...</p>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div key={idx} className="text-xs md:text-sm">
                      <span className="font-semibold text-blue-600">{msg.username}:</span>
                      <span className="text-gray-700 ml-2">{msg.message}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type message..."
                  className="flex-1 px-2 md:px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-3 md:px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Send
                </button>
              </div>
            </div>

            {/* Game Stats */}
            <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">📊 Stats</h3>
              <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Game ID:</span>
                  <span className="font-mono text-gray-800 text-xs">{gameId?.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Players:</span>
                  <span className="font-bold text-gray-800">{gameState?.players?.length || 0}/4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Your Color:</span>
                  <span className="font-bold capitalize text-gray-800">{playerColor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Win Celebration Modal */}
      {showWinAnimation && winner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in-up">
          {/* Confetti particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={`confetti-${i}`}
              className="fixed animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animationDelay: `${Math.random() * 0.5}s`,
                fontSize: '24px',
              }}
            >
              {['🎉', '🎊', '✨', '🏆', '⭐'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
          
          <div className="bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-3xl p-12 text-center shadow-2xl animate-win-celebration">
            <div className="text-8xl mb-4 animate-bounce">🏆</div>
            <h2 className="text-4xl font-bold text-white mb-2">Victory!</h2>
            <p className="text-2xl text-yellow-900 font-bold mb-4">{winner.username} Won!</p>
            <div className="text-6xl animate-rotate">✨</div>
          </div>
        </div>
      )}
    </div>
  );
}
