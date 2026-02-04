import { useEffect, useRef, useState } from 'react';

export default function LudoBoard({ gameState, onTokenClick, onDiceRoll, currentUserId }) {
  const [hoveredToken, setHoveredToken] = useState(null);
  const prevGameStateRef = useRef(null);

  // Detect token movements
  useEffect(() => {
    prevGameStateRef.current = gameState;
  }, [gameState]);

  // Color palette
  const colors = {
    red: { main: '#ef4444', dark: '#dc2626', light: '#fecaca', rgb: '239, 68, 68' },
    blue: { main: '#3b82f6', dark: '#2563eb', light: '#bfdbfe', rgb: '59, 130, 246' },
    green: { main: '#22c55e', dark: '#16a34a', light: '#bbf7d0', rgb: '34, 197, 94' },
    yellow: { main: '#eab308', dark: '#ca8a04', light: '#fef08a', rgb: '234, 179, 8' },
  };

  // Calculate token position on board
  const getTokenPosition = (token, color) => {
    const cellSize = 40;
    const boardSize = 520;
    const centerX = boardSize / 2;
    const centerY = boardSize / 2;

    // Home positions
    if (token.isHome) {
      const homeMap = {
        red: [
          { x: 30, y: 30 }, { x: 70, y: 30 }, { x: 30, y: 70 }, { x: 70, y: 70 }
        ],
        blue: [
          { x: 450, y: 450 }, { x: 490, y: 450 }, { x: 450, y: 490 }, { x: 490, y: 490 }
        ],
        green: [
          { x: 450, y: 30 }, { x: 490, y: 30 }, { x: 450, y: 70 }, { x: 490, y: 70 }
        ],
        yellow: [
          { x: 30, y: 450 }, { x: 70, y: 450 }, { x: 30, y: 490 }, { x: 70, y: 490 }
        ],
      };
      return homeMap[color][token.id] || { x: centerX, y: centerY };
    }

    // Path positions (52 positions on main path + 6 in finish area)
    const pathPositions = [];
    
    // Red path (top)
    for (let i = 0; i < 13; i++) {
      pathPositions.push({ x: i * cellSize, y: 200 + cellSize / 2 });
    }
    
    // Right turn (right side)
    for (let i = 1; i < 13; i++) {
      pathPositions.push({ x: 520 - cellSize / 2, y: 200 + i * cellSize });
    }
    
    // Bottom (right to left)
    for (let i = 12; i >= 0; i--) {
      pathPositions.push({ x: i * cellSize + cellSize / 2, y: 520 - cellSize / 2 });
    }
    
    // Left side (bottom to top)
    for (let i = 12; i >= 1; i--) {
      pathPositions.push({ x: cellSize / 2, y: 520 - i * cellSize });
    }

    if (token.position >= 0 && token.position < pathPositions.length) {
      return pathPositions[token.position];
    }

    // Finish area (center)
    return { x: centerX, y: centerY };
  };

  const handleTokenClick = (playerId, tokenIndex) => {
    if (onTokenClick && gameState?.currentPlayer?.id === playerId) {
      onTokenClick(tokenIndex);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Main Board */}
      <div className="relative w-full max-w-2xl aspect-square bg-gradient-to-br from-amber-50 via-amber-100 to-yellow-100 rounded-3xl shadow-2xl overflow-hidden border-8 border-amber-900">
        
        <svg
          viewBox="0 0 520 520"
          className="w-full h-full"
          style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}
        >
          <defs>
            {/* Gradients */}
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
            
            {/* Filters */}
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.4" />
            </filter>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Home Areas */}
          {/* Red Home */}
          <rect x="0" y="0" width="120" height="120" fill="url(#redGrad)" opacity="0.15" rx="8" />
          <text x="60" y="25" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#dc2626">🏠</text>
          <text x="60" y="110" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#dc2626">Red</text>

          {/* Blue Home */}
          <rect x="400" y="400" width="120" height="120" fill="url(#blueGrad)" opacity="0.15" rx="8" />
          <text x="460" y="425" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#2563eb">🏠</text>
          <text x="460" y="510" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#2563eb">Blue</text>

          {/* Green Home */}
          <rect x="400" y="0" width="120" height="120" fill="url(#greenGrad)" opacity="0.15" rx="8" />
          <text x="460" y="25" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#16a34a">🏠</text>
          <text x="460" y="110" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#16a34a">Green</text>

          {/* Yellow Home */}
          <rect x="0" y="400" width="120" height="120" fill="url(#yellowGrad)" opacity="0.15" rx="8" />
          <text x="60" y="425" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#ca8a04">🏠</text>
          <text x="60" y="510" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#ca8a04">Yellow</text>

          {/* Main Path - Cross Pattern */}
          {/* Horizontal paths */}
          {[...Array(13)].map((_, i) => (
            <g key={`h-${i}`}>
              <rect x={i * 40} y="200" width="40" height="40" fill="white" stroke="#d1d5db" strokeWidth="1" rx="2" />
              <rect x={i * 40} y="280" width="40" height="40" fill="white" stroke="#d1d5db" strokeWidth="1" rx="2" />
            </g>
          ))}

          {/* Vertical paths */}
          {[...Array(13)].map((_, i) => (
            <g key={`v-${i}`}>
              <rect x="200" y={i * 40} width="40" height="40" fill="white" stroke="#d1d5db" strokeWidth="1" rx="2" />
              <rect x="280" y={i * 40} width="40" height="40" fill="white" stroke="#d1d5db" strokeWidth="1" rx="2" />
            </g>
          ))}

          {/* Safe Spots */}
          {[
            { x: 100, y: 220, color: '#dc2626' },
            { x: 220, y: 100, color: '#16a34a' },
            { x: 420, y: 300, color: '#2563eb' },
            { x: 300, y: 420, color: '#ca8a04' },
          ].map((spot, i) => (
            <g key={`safe-${i}`}>
              <circle cx={spot.x} cy={spot.y} r="14" fill={spot.color} opacity="0.2" />
              <text x={spot.x} y={spot.y} fontSize="18" textAnchor="middle" dominantBaseline="middle" fill={spot.color}>⭐</text>
            </g>
          ))}

          {/* Center Finish Area */}
          <circle cx="260" cy="260" r="40" fill="#fbbf24" opacity="0.3" stroke="#ca8a04" strokeWidth="3" />
          <text x="260" y="260" fontSize="32" textAnchor="middle" dominantBaseline="middle">🏆</text>

          {/* Render Tokens */}
          {gameState && gameState.tokens && Object.keys(gameState.tokens).map(playerId => {
            const playerTokens = gameState.tokens[playerId];
            const color = playerTokens.color;
            const colorObj = colors[color];
            const canMove = gameState.currentPlayer?.id === playerId;
            
            return playerTokens.tokens.map((token, index) => {
              const pos = getTokenPosition(token, color);
              const isHovered = hoveredToken === `${playerId}-${index}`;

              return (
                <g
                  key={`token-${playerId}-${index}`}
                  className={canMove ? 'cursor-pointer' : 'cursor-not-allowed'}
                  onClick={() => handleTokenClick(playerId, index)}
                  onMouseEnter={() => canMove && setHoveredToken(`${playerId}-${index}`)}
                  onMouseLeave={() => setHoveredToken(null)}
                >
                  {/* Hover glow */}
                  {isHovered && canMove && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="24"
                      fill={colorObj.main}
                      opacity="0.25"
                      className="animate-pulse"
                    />
                  )}

                  {/* Movable indicator ring */}
                  {canMove && !isHovered && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="22"
                      fill="none"
                      stroke={colorObj.main}
                      strokeWidth="2"
                      opacity="0.5"
                      className="animate-movable-pulse"
                    />
                  )}

                  {/* Token shadow */}
                  <circle
                    cx={pos.x + 1}
                    cy={pos.y + 1}
                    r="16"
                    fill="black"
                    opacity="0.2"
                    filter="url(#shadow)"
                  />

                  {/* Token body */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="16"
                    fill={`url(#${color}Grad)`}
                    stroke="white"
                    strokeWidth="2.5"
                    filter="url(#glow)"
                    className={`transition-all duration-300 ${isHovered && canMove ? 'animate-bounce' : ''}`}
                    style={{
                      transform: isHovered && canMove ? 'scale(1.25)' : 'scale(1)',
                      transformOrigin: `${pos.x}px ${pos.y}px`,
                    }}
                  />

                  {/* Token number */}
                  <text
                    x={pos.x}
                    y={pos.y}
                    fontSize="12"
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

      {/* Player Info */}
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
                    background: {
                      red: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      blue: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      green: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      yellow: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                    }[playerTokens?.color] || '#ccc',
                  }}
                />
                <span className="font-bold text-gray-800 text-sm truncate">{player.username}</span>
              </div>
              {isCurrentPlayer && (
                <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full font-bold animate-pulse">
                  🎯 Turn
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
