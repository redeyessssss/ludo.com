import { useEffect, useRef, useState } from 'react';

export default function LudoBoard({ gameState, onTokenClick, onDiceRoll, currentUserId }) {
  const [selectedToken, setSelectedToken] = useState(null);
  const [hoveredToken, setHoveredToken] = useState(null);
  const [diceRolling, setDiceRolling] = useState(false);
  const [lastDiceValue, setLastDiceValue] = useState(null);
  const [animatingTokens, setAnimatingTokens] = useState({});
  const prevGameStateRef = useRef(null);

  // Premium color palette with gradients
  const colors = {
    red: { 
      main: '#ef4444', 
      light: '#fecaca', 
      dark: '#dc2626', 
      glow: 'rgba(239, 68, 68, 0.6)',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    },
    blue: { 
      main: '#3b82f6', 
      light: '#bfdbfe', 
      dark: '#2563eb', 
      glow: 'rgba(59, 130, 246, 0.6)',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    },
    green: { 
      main: '#22c55e', 
      light: '#bbf7d0', 
      dark: '#16a34a', 
      glow: 'rgba(34, 197, 94, 0.6)',
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
    },
    yellow: { 
      main: '#eab308', 
      light: '#fef08a', 
      dark: '#ca8a04', 
      glow: 'rgba(234, 179, 8, 0.6)',
      gradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)'
    },
  };

  // Detect token movements and trigger animations
  useEffect(() => {
    if (!prevGameStateRef.current || !gameState) {
      prevGameStateRef.current = gameState;
      return;
    }

    const newAnimatingTokens = {};
    
    // Compare previous and current token positions
    if (prevGameStateRef.current.tokens && gameState.tokens) {
      Object.keys(gameState.tokens).forEach(playerId => {
        const prevTokens = prevGameStateRef.current.tokens[playerId]?.tokens || [];
        const currTokens = gameState.tokens[playerId]?.tokens || [];
        
        currTokens.forEach((token, idx) => {
          const prevToken = prevTokens[idx];
          if (prevToken && (prevToken.position !== token.position || prevToken.isHome !== token.isHome)) {
            newAnimatingTokens[`${playerId}-${idx}`] = true;
            // Remove animation after 600ms
            setTimeout(() => {
              setAnimatingTokens(prev => {
                const updated = { ...prev };
                delete updated[`${playerId}-${idx}`];
                return updated;
              });
            }, 600);
          }
        });
      });
    }

    setAnimatingTokens(newAnimatingTokens);
    prevGameStateRef.current = gameState;
  }, [gameState]);

  // Home positions for each color
  const homePositions = {
    red: [
      { x: 15, y: 15 }, { x: 15, y: 35 }, { x: 35, y: 15 }, { x: 35, y: 35 }
    ],
    blue: [
      { x: 65, y: 65 }, { x: 65, y: 85 }, { x: 85, y: 65 }, { x: 85, y: 85 }
    ],
    green: [
      { x: 65, y: 15 }, { x: 65, y: 35 }, { x: 85, y: 15 }, { x: 85, y: 35 }
    ],
    yellow: [
      { x: 15, y: 65 }, { x: 15, y: 85 }, { x: 35, y: 65 }, { x: 35, y: 85 }
    ],
  };

  const handleTokenClick = (playerId, tokenIndex) => {
    if (onTokenClick) {
      onTokenClick(tokenIndex);
    }
  };

  return (
    <div className="w-full">
      {/* SVG Board */}
      <svg
        viewBox="0 0 100 100"
        className="w-full drop-shadow-2xl rounded-xl"
        style={{ maxHeight: '600px', aspectRatio: '1' }}
      >
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#22c55e', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#16a34a', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#eab308', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#ca8a04', stopOpacity: 1 }} />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Board Background */}
        <rect width="100" height="100" fill="#f8f9fa" rx="3" />

        {/* Home Areas with Rounded Corners */}
        {/* Red Home (Top Left) */}
        <rect x="0" y="0" width="40" height="40" fill="url(#redGrad)" opacity="0.15" rx="3" />
        <text x="20" y="8" fontSize="6" textAnchor="middle" fill="#dc2626" fontWeight="bold">🏠 Red</text>
        {homePositions.red.map((pos, i) => (
          <circle key={`red-home-${i}`} cx={pos.x} cy={pos.y} r="4.5" fill="url(#redGrad)" stroke="white" strokeWidth="1" filter="url(#shadow)" />
        ))}

        {/* Blue Home (Bottom Right) */}
        <rect x="60" y="60" width="40" height="40" fill="url(#blueGrad)" opacity="0.15" rx="3" />
        <text x="80" y="68" fontSize="6" textAnchor="middle" fill="#2563eb" fontWeight="bold">🏠 Blue</text>
        {homePositions.blue.map((pos, i) => (
          <circle key={`blue-home-${i}`} cx={pos.x} cy={pos.y} r="4.5" fill="url(#blueGrad)" stroke="white" strokeWidth="1" filter="url(#shadow)" />
        ))}

        {/* Green Home (Top Right) */}
        <rect x="60" y="0" width="40" height="40" fill="url(#greenGrad)" opacity="0.15" rx="3" />
        <text x="80" y="8" fontSize="6" textAnchor="middle" fill="#16a34a" fontWeight="bold">🏠 Green</text>
        {homePositions.green.map((pos, i) => (
          <circle key={`green-home-${i}`} cx={pos.x} cy={pos.y} r="4.5" fill="url(#greenGrad)" stroke="white" strokeWidth="1" filter="url(#shadow)" />
        ))}

        {/* Yellow Home (Bottom Left) */}
        <rect x="0" y="60" width="40" height="40" fill="url(#yellowGrad)" opacity="0.15" rx="3" />
        <text x="20" y="68" fontSize="6" textAnchor="middle" fill="#ca8a04" fontWeight="bold">🏠 Yellow</text>
        {homePositions.yellow.map((pos, i) => (
          <circle key={`yellow-home-${i}`} cx={pos.x} cy={pos.y} r="4.5" fill="url(#yellowGrad)" stroke="white" strokeWidth="1" filter="url(#shadow)" />
        ))}

        {/* Path Cells - Main Track */}
        {/* Horizontal paths */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <g key={`h-path-${i}`}>
            {/* Top path */}
            <rect x={i * 6.67} y="40" width="6.67" height="6.67" fill="white" stroke="#e5e7eb" strokeWidth="0.5" rx="0.5" />
            {/* Bottom path */}
            <rect x={i * 6.67} y="53.33" width="6.67" height="6.67" fill="white" stroke="#e5e7eb" strokeWidth="0.5" rx="0.5" />
            {/* Right path */}
            <rect x="60" y={i * 6.67} width="6.67" height="6.67" fill="white" stroke="#e5e7eb" strokeWidth="0.5" rx="0.5" />
            {/* Left path */}
            <rect x="33.33" y={i * 6.67} width="6.67" height="6.67" fill="white" stroke="#e5e7eb" strokeWidth="0.5" rx="0.5" />
          </g>
        ))}

        {/* Safe Spots with Stars */}
        {[
          { x: 10, y: 43.33, color: '#ef4444' },
          { x: 43.33, y: 10, color: '#22c55e' },
          { x: 90, y: 56.67, color: '#3b82f6' },
          { x: 56.67, y: 90, color: '#eab308' },
        ].map((spot, i) => (
          <g key={`safe-${i}`}>
            <circle cx={spot.x} cy={spot.y} r="4" fill={spot.color} opacity="0.2" />
            <text x={spot.x} y={spot.y} fontSize="5" textAnchor="middle" dominantBaseline="middle" fill={spot.color} fontWeight="bold">⭐</text>
          </g>
        ))}

        {/* Center Finish Area */}
        <circle cx="50" cy="50" r="10" fill="white" stroke="#fbbf24" strokeWidth="2" filter="url(#shadow)" />
        <circle cx="50" cy="50" r="8" fill="#fbbf24" opacity="0.3" />
        <text x="50" y="50" fontSize="8" textAnchor="middle" dominantBaseline="middle" fill="#ca8a04" fontWeight="bold">🏆</text>

        {/* Render Tokens */}
        {gameState && gameState.tokens && Object.keys(gameState.tokens).map(playerId => {
          const playerTokens = gameState.tokens[playerId];
          const color = playerTokens.color;
          
          return playerTokens.tokens.map((token, index) => {
            let pos;
            if (token.isHome) {
              pos = homePositions[color]?.[index] || { x: 50, y: 50 };
            } else {
              pos = { x: 50, y: 50 };
            }

            if (!pos || typeof pos.x === 'undefined' || typeof pos.y === 'undefined') {
              pos = { x: 50, y: 50 };
            }

            const isHovered = hoveredToken === `${playerId}-${index}`;
            const isSelected = selectedToken === `${playerId}-${index}`;
            const canMove = gameState.currentPlayer?.id === playerId;
            const gradientId = `${color}Grad`;

            return (
              <g
                key={`${playerId}-${index}`}
                className={canMove ? 'cursor-pointer' : 'cursor-not-allowed'}
                onClick={() => canMove && handleTokenClick(playerId, index)}
                onMouseEnter={() => setHoveredToken(`${playerId}-${index}`)}
                onMouseLeave={() => setHoveredToken(null)}
              >
                {/* Glow effect on hover */}
                {isHovered && canMove && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="6.5"
                    fill={colors[color].glow}
                    className="animate-pulse"
                  />
                )}

                {/* Token shadow */}
                <circle
                  cx={pos.x + 0.4}
                  cy={pos.y + 0.4}
                  r="4"
                  fill="black"
                  opacity="0.25"
                  filter="url(#shadow)"
                />

                {/* Token with gradient */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="4"
                  fill={`url(#${gradientId})`}
                  stroke="white"
                  strokeWidth="0.8"
                  filter="url(#glow)"
                  className={`transition-all duration-200 ${isHovered && canMove ? 'animate-bounce' : ''} ${animatingTokens[`${playerId}-${index}`] ? 'animate-token-move' : ''}`}
                  style={{
                    filter: isSelected ? 'brightness(1.3)' : 'url(#glow)',
                    transform: isHovered && canMove ? 'scale(1.15)' : 'scale(1)',
                    transformOrigin: `${pos.x}px ${pos.y}px`,
                  }}
                />

                {/* Token number */}
                <text
                  x={pos.x}
                  y={pos.y}
                  fontSize="2.8"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  pointerEvents="none"
                >
                  {index + 1}
                </text>
              </g>
            );
          });
        })}
      </svg>

      {/* Game Info Below Board */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {gameState?.players?.map((player) => {
          const playerTokens = gameState.tokens[player.id];
          const isCurrentPlayer = gameState.currentPlayer?.id === player.id;
          
          return (
            <div
              key={player.id}
              className={`p-4 rounded-lg transition-all duration-300 ${
                isCurrentPlayer
                  ? 'bg-yellow-100 border-2 border-yellow-400 scale-105 shadow-lg'
                  : 'bg-gray-100 border-2 border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-5 h-5 rounded-full border-2 border-white"
                  style={{
                    background: playerTokens?.color
                      ? {
                          red: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          blue: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          green: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                          yellow: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                        }[playerTokens.color]
                      : '#ccc',
                  }}
                />
                <span className="font-bold text-gray-800 text-sm">{player.username}</span>
              </div>
              {isCurrentPlayer && (
                <div className="text-center">
                  <span className="text-xs bg-yellow-300 text-yellow-900 px-2 py-1 rounded-full font-bold animate-pulse">
                    🎯 Current Turn
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
