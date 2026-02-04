import { useEffect, useRef, useState } from 'react';

export default function LudoBoard({ gameState, onTokenClick, onDiceRoll, currentUserId, availableMoves = [] }) {
  const canvasRef = useRef(null);
  const [hoveredToken, setHoveredToken] = useState(null);

  const BOARD_SIZE = 700;
  const CELL_SIZE = 35;
  const TOKEN_RADIUS = 16;
  
  const COLORS = {
    red: '#FF6B6B',
    blue: '#4ECDC4',
    green: '#45B7D1',
    yellow: '#FFA502',
    white: '#FFFFFF',
    black: '#2C3E50',
    lightGray: '#F5F5F5',
    darkGray: '#BDC3C7',
    gold: '#FFD700',
    lightBlue: '#E8F4F8',
  };

  // Get board path (52 cells)
  const getBoardPath = () => {
    const path = [];
    const startX = 6;
    const startY = 6;
    
    // Top row (left to right)
    for (let i = 0; i < 13; i++) {
      path.push({ x: startX + i, y: startY });
    }
    
    // Right column (top to bottom)
    for (let i = 1; i < 13; i++) {
      path.push({ x: startX + 12, y: startY + i });
    }
    
    // Bottom row (right to left)
    for (let i = 12; i >= 0; i--) {
      path.push({ x: startX + i, y: startY + 12 });
    }
    
    // Left column (bottom to top)
    for (let i = 12; i >= 1; i--) {
      path.push({ x: startX, y: startY + i });
    }
    
    return path;
  };

  // Home positions
  const getHomePositions = (color) => {
    const homes = {
      red: [
        { x: 1, y: 1 }, { x: 4, y: 1 }, { x: 1, y: 4 }, { x: 4, y: 4 }
      ],
      blue: [
        { x: 21, y: 1 }, { x: 24, y: 1 }, { x: 21, y: 4 }, { x: 24, y: 4 }
      ],
      green: [
        { x: 21, y: 21 }, { x: 24, y: 21 }, { x: 21, y: 24 }, { x: 24, y: 24 }
      ],
      yellow: [
        { x: 1, y: 21 }, { x: 4, y: 21 }, { x: 1, y: 24 }, { x: 4, y: 24 }
      ],
    };
    return homes[color] || [];
  };

  // Safe positions
  const getSafePositions = () => [0, 8, 13, 21, 26, 34, 39, 47];

  // Draw board
  const drawBoard = (ctx) => {
    // Background
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);

    // Draw home areas
    drawHomeArea(ctx, 'red', 0, 0);
    drawHomeArea(ctx, 'blue', 560, 0);
    drawHomeArea(ctx, 'green', 560, 560);
    drawHomeArea(ctx, 'yellow', 0, 560);

    // Draw main path
    const path = getBoardPath();
    const safePositions = getSafePositions();

    path.forEach((pos, idx) => {
      const x = pos.x * CELL_SIZE;
      const y = pos.y * CELL_SIZE;
      
      // Cell background
      ctx.fillStyle = COLORS.lightGray;
      ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
      
      // Cell border
      ctx.strokeStyle = COLORS.darkGray;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

      // Safe spot
      if (safePositions.includes(idx)) {
        ctx.fillStyle = COLORS.gold;
        ctx.beginPath();
        ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE / 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = COLORS.white;
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', x + CELL_SIZE / 2, y + CELL_SIZE / 2);
      }
    });

    // Center finish area
    ctx.fillStyle = COLORS.gold;
    ctx.beginPath();
    ctx.arc(BOARD_SIZE / 2, BOARD_SIZE / 2, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Trophy in center
    ctx.fillStyle = COLORS.white;
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏆', BOARD_SIZE / 2, BOARD_SIZE / 2);
  };

  // Draw home area
  const drawHomeArea = (ctx, color, startX, startY) => {
    ctx.fillStyle = COLORS[color];
    ctx.globalAlpha = 0.12;
    ctx.fillRect(startX, startY, 140, 140);
    ctx.globalAlpha = 1;
    
    ctx.strokeStyle = COLORS[color];
    ctx.lineWidth = 3;
    ctx.strokeRect(startX, startY, 140, 140);
  };

  // Draw tokens
  const drawTokens = (ctx) => {
    if (!gameState || !gameState.tokens) return;

    const path = getBoardPath();

    Object.keys(gameState.tokens).forEach(playerId => {
      const playerTokens = gameState.tokens[playerId];
      const color = playerTokens.color;

      playerTokens.tokens.forEach((token, idx) => {
        let x, y;

        if (token.isHome) {
          const homePos = getHomePositions(color)[idx];
          x = homePos.x * CELL_SIZE + CELL_SIZE / 2;
          y = homePos.y * CELL_SIZE + CELL_SIZE / 2;
        } else if (token.position >= 0 && token.position < path.length) {
          const pos = path[token.position];
          x = pos.x * CELL_SIZE + CELL_SIZE / 2;
          y = pos.y * CELL_SIZE + CELL_SIZE / 2;
        } else {
          // Finish area
          const angle = (idx * Math.PI * 2) / 4 - Math.PI / 2;
          x = BOARD_SIZE / 2 + Math.cos(angle) * 30;
          y = BOARD_SIZE / 2 + Math.sin(angle) * 30;
        }

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.beginPath();
        ctx.arc(x + 3, y + 3, TOKEN_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Token
        ctx.fillStyle = COLORS[color];
        ctx.beginPath();
        ctx.arc(x, y, TOKEN_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = COLORS.white;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Number
        ctx.fillStyle = COLORS.white;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(idx + 1, x, y);

        // Highlight available
        if (availableMoves.includes(idx) && gameState.currentPlayer?.id === playerId) {
          ctx.strokeStyle = '#2ECC71';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(x, y, TOKEN_RADIUS + 8, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    });
  };

  // Draw everything
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    drawBoard(ctx);
    drawTokens(ctx);
  }, [gameState, availableMoves]);

  // Handle click
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!gameState || !gameState.tokens) return;

    const playerTokens = gameState.tokens[currentUserId];
    if (!playerTokens) return;

    const path = getBoardPath();

    playerTokens.tokens.forEach((token, idx) => {
      let tokenX, tokenY;

      if (token.isHome) {
        const homePos = getHomePositions(playerTokens.color)[idx];
        tokenX = homePos.x * CELL_SIZE + CELL_SIZE / 2;
        tokenY = homePos.y * CELL_SIZE + CELL_SIZE / 2;
      } else if (token.position >= 0 && token.position < path.length) {
        const pos = path[token.position];
        tokenX = pos.x * CELL_SIZE + CELL_SIZE / 2;
        tokenY = pos.y * CELL_SIZE + CELL_SIZE / 2;
      } else {
        const angle = (idx * Math.PI * 2) / 4 - Math.PI / 2;
        tokenX = BOARD_SIZE / 2 + Math.cos(angle) * 30;
        tokenY = BOARD_SIZE / 2 + Math.sin(angle) * 30;
      }

      const distance = Math.sqrt((x - tokenX) ** 2 + (y - tokenY) ** 2);
      if (distance < TOKEN_RADIUS + 12 && availableMoves.includes(idx)) {
        onTokenClick(idx);
      }
    });
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Board */}
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-gray-800">
        <canvas
          ref={canvasRef}
          width={BOARD_SIZE}
          height={BOARD_SIZE}
          onClick={handleCanvasClick}
          className="cursor-pointer"
          style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
        />
      </div>

      {/* Players */}
      <div className="mt-8 w-full max-w-2xl grid grid-cols-2 md:grid-cols-4 gap-4">
        {gameState?.players?.map((player) => {
          const playerTokens = gameState.tokens[player.id];
          const isCurrentPlayer = gameState.currentPlayer?.id === player.id;
          
          return (
            <div
              key={player.id}
              className={`p-4 rounded-xl transition-all duration-300 text-center font-semibold ${
                isCurrentPlayer
                  ? 'bg-gradient-to-r from-yellow-300 to-yellow-400 border-3 border-yellow-600 scale-105 shadow-xl'
                  : 'bg-gray-100 border-2 border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <div
                  className="w-5 h-5 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: playerTokens?.color }}
                />
                <span className="text-gray-800 text-sm">{player.username}</span>
              </div>
              {isCurrentPlayer && (
                <span className="text-xs bg-yellow-500 text-white px-3 py-1 rounded-full font-bold animate-pulse">
                  🎯 Your Turn
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
