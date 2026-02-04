import { useEffect, useRef, useState } from 'react';

export default function LudoBoard({ gameState, onTokenClick, onDiceRoll, currentUserId }) {
  const [selectedToken, setSelectedToken] = useState(null);
  const [hoveredToken, setHoveredToken] = useState(null);
  const [animatingTokens, setAnimatingTokens] = useState({});
  const prevGameStateRef = useRef(null);

  // Detect token movements and trigger animations
  useEffect(() => {
    if (!prevGameStateRef.current || !gameState) {
      prevGameStateRef.current = gameState;
      return;
    }

    const newAnimatingTokens = {};
    
    if (prevGameStateRef.current.tokens && gameState.tokens) {
      Object.keys(gameState.tokens).forEach(playerId => {
        const prevTokens = prevGameStateRef.current.tokens[playerId]?.tokens || [];
        const currTokens = gameState.tokens[playerId]?.tokens || [];
        
        currTokens.forEach((token, idx) => {
          const prevToken = prevTokens[idx];
          if (prevToken && (prevToken.position !== token.position || prevToken.isHome !== token.isHome)) {
            newAnimatingTokens[`${playerId}-${idx}`] = true;
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

  // Color palette
  const colors = {
    red: { main: '#ef4444', dark: '#dc2626', light: '#fecaca' },
    blue: { main: '#3b82f6', dark: '#2563eb', light: '#bfdbfe' },
    green: { main: '#22c55e', dark: '#16a34a', light: '#bbf7d0' },
    yellow: { main: '#eab308', dark: '#ca8a04', light: '#fef08a' },
  };

  // Home positions for each color (4 tokens per player)
  const homePositions = {
    red: [
      { x: 30, y: 30 }, { x: 50, y: 30 }, { x: 30, y: 50 }, { x: 50, y: 50 }
    ],
    blue: [
      { x: 470, y: 470 }, { x: 490, y: 470 }, { x: 470, y: 490 }, { x: 490, y: 490 }
    ],
    green: [
      { x: 470, y: 30 }, { x: 490, y: 30 }, { x: 470, y: 50 }, { x: 490, y: 50 }
    ],
    yellow: [
      { x: 30, y: 470 }, { x: 50, y: 470 }, { x: 30, y: 490 }, { x: 50, y: 490 }
    ],
  };

  const handleTokenClick = (playerId, tokenIndex) => {
    if (onTokenClick) {
      onTokenClick(tokenIndex);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Main Board Container */}
      <div className="relative w-full max-w-2xl aspect-square bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl shadow-2xl overflow-hidden border-8 border-amber-900">
        
        {/* SVG Board */}
        <svg
          viewBox="0 0 520 520"
          className="w-full h-full"
          style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}
        >
          {/* Define gradients */}
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
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Home Areas - Colored Corners */}
          {/* Red Home - Top Left */}
          <rect x="0" y="0" width="100" height="100" fill="url(#redGrad)" opacity="0.2" />
          <text x="50" y="20" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#dc2626">🏠 Red</text>
          
          {/* Blue Home - Bottom Right */}
          <rect x="420" y="420" width="100" height="100" fill="url(#blueGrad)" opacity="0.2" />
          <text x="470" y="440" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#2563eb">🏠 Blue</text>
          
          {/* Green Home - Top Right */}
          <rect x="420" y="0" width="100" height="100" fill="url(#greenGrad)" opacity="0.2" />
          <text x="470" y="20" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#16a34a">🏠 Green</text>
          
          {/* Yellow Home - Bottom Left */}
          <rect x="0" y="420" width="100" height="100" fill="url(#yellowGrad)" opacity="0.2" />
          <text x="50" y="440" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#ca8a04">🏠 Yellow</text>

          {/* Main Board Path - Cross Pattern */}
          {/* Horizontal paths */}
          {[...Array(13)].map((_, i) => (
            <g key={`h-path-${i}`}>
              {/* Top horizontal path */}
              <rect x={i * 40} y="200" width="40" height="40" fill="white" stroke="#d1d5db" strokeWidth="1" />
              {/* Bottom horizontal path */}
              <rect x={i * 40} y="280" width="40" height="40" fill="white" stroke="#d1d5db" strokeWidth="1" />
            </g>
          ))}

          {/* Vertical paths */}
          {[...Array(13)].map((_, i) => (
            <g key={`v-path-${i}`}>
              {/* Left vertical path */}
              <rect x="200" y={i * 40} width="40" height="40" fill="white" stroke="#d1d5db" strokeWidth="1" />
              {/* Right vertical path */}
              <rect x="280" y={i * 40} width="40" height="40" fill="white" stroke="#d1d5db" strokeWidth="1" />
            </g>
          ))}

          {/* Center finish area */}
          <circle cx="260" cy="260" r="35" fill="#fbbf24" opacity="0.3" stroke="#ca8a04" strokeWidth="2" />
          <text x="260" y="265" fontSize="28" textAnchor="middle" dominantBaseline="middle">🏆</text>

          {/* Safe spots - Stars */}
          {[
            { x: 100, y: 220, color: '#dc2626' },
            { x: 220, y: 100, color: '#16a34a' },
            { x: 420, y: 300, color: '#2563eb' },
            { x: 300, y: 420, color: '#ca8a04' },
          ].map((spot, i) => (
            <g key={`safe-${i}`}>
              <circle cx={spot.x} cy={spot.y} r="12" fill={spot.color} opacity="0.15" />
              <text x={spot.x} y={spot.y} fontSize="16" textAnchor="middle" dominantBaseline="middle" fill={spot.color}>⭐</text>
            </g>
          ))}

          {/* Render Tokens */}
          {gameState && gameState.tokens && Object.keys(gameState.tokens).map(playerId => {
            const playerTokens = gameState.tokens[playerId];
            const color = playerTokens.color;
            const colorObj = colors[color];
            
            return playerTokens.tokens.map((token, index) => {
              let pos;
              if (token.isHome) {
                pos = homePositions[color]?.[index] || { x: 260, y: 260 };
              } else {
                pos = { x: 260, y: 260 };
              }

              if (!pos || typeof pos.x === 'undefined' || typeof pos.y === 'undefined') {
                pos = { x: 260, y: 260 };
              }

              const isHovered = hoveredToken === `${playerId}-${index}`;
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
                  {/* Glow on hover */}
                  {isHovered && canMove && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="22"
                      fill={colorObj.main}
                      opacity="0.2"
                      className="animate-pulse"
                    />
                  )}

                  {/* Movable indicator */}
                  {canMove && !isHovered && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="20"
                      fill="none"
                      stroke={colorObj.main}
                      strokeWidth="1.5"
                      opacity="0.4"
                      className="animate-movable-pulse"
                    />
                  )}

                  {/* Token shadow */}
                  <circle
                    cx={pos.x + 1}
                    cy={pos.y + 1}
                    r="14"
                    fill="black"
                    opacity="0.2"
                    filter="url(#shadow)"
                  />

                  {/* Token body */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="14"
                    fill={`url(#${gradientId})`}
                    stroke="white"
                    strokeWidth="2"
                    filter="url(#shadow)"
                    className={`transition-all duration-200 ${isHovered && canMove ? 'animate-bounce' : ''} ${animatingTokens[`${playerId}-${index}`] ? 'animate-token-move' : ''}`}
                    style={{
                      transform: isHovered && canMove ? 'scale(1.2)' : 'scale(1)',
                      transformOrigin: `${pos.x}px ${pos.y}px`,
                    }}
                  />

                  {/* Token number */}
                  <text
                    x={pos.x}
                    y={pos.y}
                    fontSize="10"
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
      </div>

      {/* Player Info Below Board */}
      <div className="mt-6 w-full max-w-2xl grid grid-cols-2 md:grid-cols-4 gap-3">
        {gameState?.players?.map((player) => {
          const playerTokens = gameState.tokens[player.id];
          const isCurrentPlayer = gameState.currentPlayer?.id === player.id;
          
          return (
            <div
              key={player.id}
              className={`p-3 rounded-lg transition-all duration-300 text-center ${
                isCurrentPlayer
                  ? 'bg-yellow-200 border-2 border-yellow-500 scale-105 shadow-lg'
                  : 'bg-gray-100 border-2 border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <div
                  className="w-4 h-4 rounded-full border-2 border-white"
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
                  <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full font-bold animate-pulse">
                    🎯 Turn
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
