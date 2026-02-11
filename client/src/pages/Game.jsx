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
  const [availableMoves, setAvailableMoves] = useState([]);
  const [lastAction, setLastAction] = useState(null);
  const [showFireworks, setShowFireworks] = useState(false);

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
      console.log('🎮 Game state received:', {
        playerCount: data.players?.length,
        players: data.players?.map(p => `${p.username} (${p.isBot ? 'BOT' : 'HUMAN'}, ID: ${p.id})`),
        currentPlayer: data.currentPlayer?.username,
        currentPlayerId: data.currentPlayer?.id,
        myUserId: user.id,
        isMyTurn: data.currentPlayer?.id === user.id,
        isBotGame: data.players?.some(p => p.isBot)
      });
      setGameState(data);
    });

    newSocket.on('game:update', (data) => {
      console.log('📥 Game update received:', {
        action: data.action,
        botAction: data.botAction,
        currentPlayer: data.gameState?.currentPlayer?.username,
        isBot: data.gameState?.currentPlayer?.isBot,
        diceValue: data.diceValue,
        availableMoves: data.availableMoves?.length
      });
      setGameState(data.gameState);
      
      if (data.action === 'player_left') {
        setLastAction(`⚠️ ${data.leftPlayer} left the game. ${data.message}`);
        return;
      }
      
      if (data.action === 'three_sixes_cancelled') {
        setLastAction('⚠️ Three 6s in a row! First two count, third cancelled. Turn passes.');
        setDiceValue(null);
        setAvailableMoves([]);
        return;
      }
      
      if (data.action === 'no_tokens_outside') {
        setLastAction('All tokens in home. Need 6 to start. Turn passes.');
        setDiceValue(data.diceValue);
        setAvailableMoves([]);
        return;
      }
      
      if (data.action === 'no_valid_moves') {
        setLastAction('No valid moves available. Turn passes.');
        setDiceValue(data.diceValue);
        setAvailableMoves([]);
        return;
      }
      
      if (data.diceValue) {
        console.log('🎲 Dice rolled:', data.diceValue);
        setDiceValue(data.diceValue);
        setShowDiceAnimation(true);
        setAvailableMoves(data.availableMoves || []);
        
        // Show action message
        if (data.reason === 'rolled_six') {
          setLastAction('🎉 Rolled a 6! Get an extra turn!');
        } else if (data.reason === 'three_sixes_limit') {
          setLastAction('⚠️ Three 6s in a row! Turn passes to next player.');
        } else if (data.captured && data.captured.length > 0) {
          setLastAction(`🎯 Captured ${data.captured.length} token(s)! Extra turn!`);
        }
        
        setTimeout(() => setShowDiceAnimation(false), 1000);
      } else if (data.action === 'token_moved') {
        console.log('🚀 Token moved! tokenFinished:', data.tokenFinished, 'extraTurn:', data.extraTurn);
        
        // If no extra turn, clear everything and pass turn
        if (!data.extraTurn) {
          console.log('🔄 Turn passed - clearing dice and moves');
          setDiceValue(null);
          setAvailableMoves([]);
        } else {
          // Has extra turn, set available moves
          setAvailableMoves(data.availableMoves || []);
        }
        
        // Check if token reached home (finished)
        if (data.tokenFinished === true) {
          console.log('🎆 FIREWORKS TRIGGERED! Token reached home!');
          setShowFireworks(true);
          setLastAction('🎉🎆 TOKEN REACHED HOME! 🎆🎉');
          setTimeout(() => {
            console.log('🎆 Fireworks ended');
            setShowFireworks(false);
          }, 4000);
        }
        // Show move feedback
        else if (data.captured && data.captured.length > 0) {
          setLastAction(`🎯 Captured ${data.captured.length} token(s)! Extra turn!`);
        } else if (data.extraTurn) {
          setLastAction('🎉 Extra turn! Roll again!');
        } else {
          setLastAction('✓ Move complete. Next player\'s turn!');
        }
      }
    });

    newSocket.on('game:end', (data) => {
      setWinner(data.winner);
      setShowWinAnimation(true);
      
      const isRanked = data.isRanked;
      const ratingChanges = data.ratingChanges || {};
      const myRatingChange = ratingChanges[user.id];
      
      let message = data.reason === 'opponents_left' 
        ? `🏆 ${data.winner.username} wins!\n\nAll opponents have left the game.`
        : `🎉 ${data.winner.username} won the game!`;
      
      // Add rating change info for ranked matches
      if (isRanked && myRatingChange) {
        const change = myRatingChange.change;
        const changeText = change >= 0 ? `+${change}` : change;
        message += `\n\n📊 Ranked Match\nRating: ${myRatingChange.old} → ${myRatingChange.new} (${changeText})`;
      }
      
      setTimeout(() => {
        alert(message);
        navigate('/dashboard');
      }, 2000);
    });

    newSocket.on('chat:message', (data) => {
      setChatMessages(prev => [...prev, data]);
    });

    // Handle tab close / page refresh
    const handleBeforeUnload = () => {
      if (newSocket && newSocket.connected) {
        console.log('🚪 Tab closing - disconnecting from game');
        newSocket.close();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      newSocket.close();
    };
  }, [user, navigate, setGameState, setDiceValue]);

  const handleRollDice = () => {
    // Prevent rolling if:
    // 1. Already rolling
    // 2. No socket connection
    // 3. Not current player
    // 4. Already have available moves (already rolled, need to move first)
    if (rolling || !socket || gameState?.currentPlayer?.id !== user.id || availableMoves.length > 0) {
      console.log('❌ Cannot roll:', { rolling, hasSocket: !!socket, isCurrentPlayer: gameState?.currentPlayer?.id === user.id, availableMoves: availableMoves.length });
      return;
    }
    
    console.log('🎲 Rolling dice...');
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
    
    // Check if user is registered (has a real account, not guest)
    if (!user || user.isGuest || !user.id || user.id.startsWith('guest_')) {
      alert('⚠️ Chat is only available for registered users. Please sign up or log in to use chat.');
      return;
    }
    
    socket.emit('chat:send', { gameId, userId: user.id, message });
    setMessage('');
  };

  const isCurrentPlayer = gameState?.currentPlayer?.id === user.id;
  const playerColor = gameState?.tokens?.[user.id]?.color || 'red';
  
  // Get dice color based on current player
  const currentPlayerColor = gameState?.tokens?.[gameState?.currentPlayer?.id]?.color || 'yellow';
  const diceColorMap = {
    red: 'from-red-400 to-red-600',
    green: 'from-green-400 to-green-600',
    blue: 'from-blue-400 to-blue-600',
    yellow: 'from-yellow-300 to-yellow-500'
  };
  const diceColor = diceColorMap[currentPlayerColor] || 'from-yellow-300 to-yellow-500';

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
              {/* Game Board */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-2 md:p-4 shadow-inner">
                {/* Last Action Display */}
                {lastAction && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 rounded-lg text-center animate-fade-in-up">
                    <p className="text-sm md:text-base font-bold text-gray-800">{lastAction}</p>
                  </div>
                )}

                {/* Available Moves Indicator */}
                {availableMoves.length > 0 && isCurrentPlayer && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400 rounded-lg text-center animate-pulse">
                    <p className="text-sm md:text-base font-bold text-green-800">
                      🎯 {availableMoves.length} token(s) available to move
                    </p>
                  </div>
                )}

                {/* Board with Dice positioned at center */}
                <div className="relative">
                  <LudoBoard
                    gameState={gameState}
                    onTokenClick={handleTokenClick}
                    onDiceRoll={handleRollDice}
                    currentUserId={user.id}
                    availableMoves={availableMoves}
                  />
                  
                  {/* Dice positioned at center of board */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="flex flex-col items-center gap-3 pointer-events-auto">
                      {/* Dice Display with player color */}
                      <div
                        className={`w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br ${diceColor} rounded-2xl shadow-2xl flex items-center justify-center text-4xl md:text-6xl font-bold text-white cursor-pointer transition-all duration-300 border-4 border-white ${
                          showDiceAnimation ? 'animate-dice-roll' : ''
                        } ${isCurrentPlayer ? 'hover:scale-110 hover:shadow-3xl' : 'opacity-70'}`}
                        onClick={handleRollDice}
                      >
                        {diceValue || '🎲'}
                      </div>

                      {/* Roll Button - compact version */}
                      {isCurrentPlayer && (
                        <button
                          onClick={handleRollDice}
                          disabled={rolling || availableMoves.length > 0}
                          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 transform ${
                            !rolling && availableMoves.length === 0
                              ? 'bg-gradient-to-r from-green-400 to-green-600 text-white hover:scale-105 active:scale-95 shadow-lg'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {rolling ? 'Rolling...' : availableMoves.length > 0 ? 'Move Token' : 'Roll'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Instructions below board */}
                <div className="mt-4 bg-blue-50 border-2 border-blue-300 rounded-lg p-3 text-left text-sm">
                  <p className="text-gray-700 font-semibold mb-2">📋 How to Play:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>✓ Click the dice in the center when it's your turn</li>
                    <li>✓ Click on highlighted tokens to move them</li>
                    <li>✓ Roll 6 to bring tokens out of home</li>
                    <li>✓ Reach the center to win!</li>
                  </ul>
                </div>
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
              
              {/* Chat restriction notice for guests */}
              {(!user || user.isGuest || user.id?.startsWith('guest_')) && (
                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-300 rounded-lg text-xs text-yellow-800">
                  🔒 Chat is only available for registered users. <a href="/register" className="underline font-semibold">Sign up</a> or <a href="/login" className="underline font-semibold">log in</a> to chat.
                </div>
              )}
              
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
                  placeholder={user && !user.isGuest && !user.id?.startsWith('guest_') ? "Type message..." : "Login to chat..."}
                  disabled={!user || user.isGuest || user.id?.startsWith('guest_')}
                  className="flex-1 px-2 md:px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!user || user.isGuest || user.id?.startsWith('guest_')}
                  className="px-3 md:px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-all duration-300 hover:scale-105 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:scale-100"
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

      {/* Fireworks Celebration when token reaches home */}
      {showFireworks && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {/* Firework particles */}
          {[...Array(30)].map((_, i) => (
            <div
              key={`firework-${i}`}
              className="fixed animate-firework"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${Math.random() * 2}s`,
                fontSize: `${20 + Math.random() * 20}px`,
              }}
            >
              {['🎆', '🎇', '✨', '💥', '⭐', '🌟'][Math.floor(Math.random() * 6)]}
            </div>
          ))}
          
          {/* Center celebration message */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl shadow-2xl text-2xl font-bold">
              🎉 Token Reached Home! 🎉
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
