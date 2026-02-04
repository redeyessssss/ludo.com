import { useEffect, useRef, useState } from 'react';

export default function LudoBoard({ gameState, onTokenClick, onDiceRoll, currentUserId }) {
  const [selectedToken, setSelectedToken] = useState(null);
  const [hoveredToken, setHoveredToken] = useState(null);

  // Modern color palette
  const colors = {
    red: { main: '#ef4444', light: '#fecaca', dark: '#dc2626', glow: 'rgba(239, 68, 68, 0.4)' },
    blue: { main: '#3b82f6', light: '#bfdbfe', dark: '#2563eb', glow: 'rgba(59, 130, 246, 0.4)' },
    green: { main: '#22c55e', light: '#bbf7d0', dark: '#16a34a', glow: 'rgba(34, 197, 94, 0.4)' },
    yellow: { main: '#eab308', light: '#fef08a', dark: '#ca8a04', glow: 'rgba(234, 179, 8, 0.4)' },
  };

  // Home positions for each color
  const homePositions = {
    red: [
      { x: 15, y: 15 }, { x: 15, y: 35 }, { x: 35, y: 15 }, { x: 35, y: 35 }
    ],
    blue: { main: '#3b82f6', light: '#bfdbfe', dark: '#2563eb', glow: 'rgba(59, 130, 246, 0.4)' },
    green: [
      { x: 65, y: 65 }, { x: 65, y: 85 }, { x: 85, y: 65 }, { x: 85, y: 85 }
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
    <div className="relative">
      {/* Modern SVG-based Ludo Board */}
      <svg
        viewBox="0 0 100 100"
        className="w-full max-w-2xl mx-auto drop-shadow-2xl"
        style={{ maxHeight: '600px' }}
      >
        {/* Board Background */}
        <rect width="100" height="100" fill="#1f2937" rx="2" />
        
        {/* Home Areas */}
        {/* Red Home (Top Left) */}
        <rect x="0" y="0" width="40" height="40" fill={colors.red.light} />
        <rect x="2" y="2" width="36" height="36" fill={colors.red.main} opacity="0.1" rx="2" />
        {homePositions.red.map((pos, i) => (
          <circle
            key={`red-home-${i}`}
            cx={pos.x}
            cy={pos.y}
            r="6"
            fill={colors.red.main}
            opacity="0.3"
            stroke={colors.red.dark}
            strokeWidth="0.5"
          />
        ))}
        
        {/* Green Home (Top Right) */}
        <rect x="60" y="0" width="40" height="40" fill={colors.green.light} />
        <rect x="62" y="2" width="36" height="36" fill={colors.green.main} opacity="0.1" rx="2" />
        {homePositions.green.map((pos, i) => (
          <circle
            key={`green-home-${i}`}
            cx={pos.x}
            cy={pos.y}
            r="6"
            fill={colors.green.main}
            opacity="0.3"
            stroke={colors.green.dark}
            strokeWidth="0.5"
          />
        ))}
        
        {/* Yellow Home (Bottom Left) */}
        <rect x="0" y="60" width="40" height="40" fill={colors.yellow.light} />
        <rect x="2" y="62" width="36" height="36" fill={colors.yellow.main} opacity="0.1" rx="2" />
        {homePositions.yellow.map((pos, i) => (
          <circle
            key={`yellow-home-${i}`}
            cx={pos.x}
            cy={pos.y}
            r="6"
            fill={colors.yellow.main}
            opacity="0.3"
            stroke={colors.yellow.dark}
            strokeWidth="0.5"
          />
        ))}
        
        {/* Blue Home (Bottom Right) */}
        <rect x="60" y="60" width="40" height="40" fill={colors.blue.light} />
        <rect x="62" y="62" width="36" height="36" fill={colors.blue.main} opacity="0.1" rx="2" />
        {[
          { x: 65, y: 65 }, { x: 65, y: 85 }, { x: 85, y: 65 }, { x: 85, y: 85 }
        ].map((pos, i) => (
          <circle
            key={`blue-home-${i}`}
            cx={pos.x}
            cy={pos.y}
            r="6"
            fill={colors.blue.main}
            opacity="0.3"
            stroke={colors.blue.dark}
            strokeWidth="0.5"
          />
        ))}

        {/* Center Cross Paths */}
        <rect x="40" y="0" width="20" height="40" fill="#f3f4f6" />
        <rect x="60" y="40" width="40" height="20" fill="#f3f4f6" />
        <rect x="40" y="60" width="20" height="40" fill="#f3f4f6" />
        <rect x="0" y="40" width="40" height="20" fill="#f3f4f6" />

        {/* Path Cells with modern styling */}
        {/* Vertical paths */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <g key={`v-path-${i}`}>
            <rect x="40" y={i * 6.67} width="6.67" height="6.67" fill="white" stroke="#e5e7eb" strokeWidth="0.3" rx="0.5" />
            <rect x="53.33" y={i * 6.67} width="6.67" height="6.67" fill="white" stroke="#e5e7eb" strokeWidth="0.3" rx="0.5" />
            <rect x="40" y={60 + i * 6.67} width="6.67" height="6.67" fill="white" stroke="#e5e7eb" strokeWidth="0.3" rx="0.5" />
            <rect x="53.33" y={60 + i * 6.67} width="6.67" height="6.67" fill="white" stroke="#e5e7eb" strokeWidth="0.3" rx="0.5" />
          </g>
        ))}

        {/* Horizontal paths */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <g key={`h-path-${i}`}>
            <rect x={i * 6.67} y="40" width="6.67" height="6.67" fill="white" stroke="#e5e7eb" strokeWidth="0.3" rx="0.5" />
            <rect x={i * 6.67} y="53.33" width="6.67" height="6.67" fill="white" stroke="#e5e7eb" strokeWidth="0.3" rx="0.5" />
            <rect x={60 + i * 6.67} y="40" width="6.67" height="6.67" fill="white" stroke="#e5e7eb" strokeWidth="0.3" rx="0.5" />
            <rect x={60 + i * 6.67} y="53.33" width="6.67" height="6.67" fill="white" stroke="#e5e7eb" strokeWidth="0.3" rx="0.5" />
          </g>
        ))}

        {/* Safe spots with star icons */}
        {[
          { x: 10, y: 43.33, color: colors.red.main },
          { x: 43.33, y: 10, color: colors.green.main },
          { x: 90, y: 56.67, color: colors.blue.main },
          { x: 56.67, y: 90, color: colors.yellow.main },
        ].map((spot, i) => (
          <g key={`safe-${i}`}>
            <circle cx={spot.x} cy={spot.y} r="3" fill={spot.color} opacity="0.2" />
            <text x={spot.x} y={spot.y} fontSize="4" textAnchor="middle" dominantBaseline="middle" fill={spot.color}>★</text>
          </g>
        ))}

        {/* Center Triangle (Home Stretch) */}
        <polygon points="50,40 50,60 40,50" fill={colors.red.main} opacity="0.3" />
        <polygon points="60,50 40,50 50,40" fill={colors.green.main} opacity="0.3" />
        <polygon points="50,60 50,40 60,50" fill={colors.blue.main} opacity="0.3" />
        <polygon points="40,50 60,50 50,60" fill={colors.yellow.main} opacity="0.3" />

        {/* Center Star */}
        <circle cx="50" cy="50" r="8" fill="white" />
        <circle cx="50" cy="50" r="6" fill="#fbbf24" />
        <text x="50" y="50" fontSize="6" textAnchor="middle" dominantBaseline="middle" fill="white">★</text>

        {/* Render Tokens */}
        {gameState && gameState.tokens && Object.keys(gameState.tokens).map(playerId => {
          const playerTokens = gameState.tokens[playerId];
          const color = playerTokens.color;
          
          return playerTokens.tokens.map((token, index) => {
            let pos;
            if (token.isHome) {
              pos = homePositions[color][index];
            } else {
              // Simplified: just show in center for now
              pos = { x: 50, y: 50 };
            }

            const isHovered = hoveredToken === `${playerId}-${index}`;
            const isSelected = selectedToken === `${playerId}-${index}`;
            const canMove = gameState.currentPlayer?.id === playerId;

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
                    r="5"
                    fill={colors[color].glow}
                    className="animate-pulse"
                  />
                )}
                
                {/* Token shadow */}
                <circle
                  cx={pos.x + 0.3}
                  cy={pos.y + 0.3}
                  r="3.5"
                  fill="black"
                  opacity="0.2"
                />
                
                {/* Token */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="3.5"
                  fill={colors[color].main}
                  stroke="white"
                  strokeWidth="0.5"
                  className={`transition-all duration-200 ${isHovered && canMove ? 'scale-110' : ''}`}
                  style={{
                    filter: isSelected ? 'brightness(1.2)' : 'none',
                    transform: isHovered && canMove ? 'scale(1.1)' : 'scale(1)',
                    transformOrigin: `${pos.x}px ${pos.y}px`,
                  }}
                />
                
                {/* Token number */}
                <text
                  x={pos.x}
                  y={pos.y}
                  fontSize="2.5"
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

      {/* Game Info Overlay */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-lg">
          <span className="text-sm font-medium text-gray-600">Current Turn:</span>
          {gameState?.currentPlayer && (
            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  backgroundColor: colors[gameState.tokens[gameState.currentPlayer.id]?.color]?.main || '#gray',
                }}
              />
              <span className="font-bold">{gameState.currentPlayer.username}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
