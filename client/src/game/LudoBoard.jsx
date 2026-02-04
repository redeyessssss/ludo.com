import { useEffect, useRef, useState } from 'react';

export default function LudoBoard({ gameState, onTokenClick, onDiceRoll, currentUserId, availableMoves = [] }) {
  const canvasRef = useRef(null);

  const BOARD_SIZE = 800;
  const CELL_SIZE = 40;
  const TOKEN_RADIUS = 18;
  
  const COLORS = {
    red: '#E74C3C',
    blue: '#3498DB',
    green: '#2ECC71',
    yellow: '#F1C40F',
    white: '#FFFFFF',
    black: '#2C3E50',
    lightGray: '#ECF0F1',
    darkGray: '#95A5A6',
    gold: '#FFD700',
  };

  // Get board path (52 cells in cross pattern)
  const getBoardPath = () => {
    const path = [];
    
    // Top horizontal path (left to right) - 13 cells
    for (let i = 0; i < 13; i++) {
      path.push({ x: 6 + i, y: 6 });
    }
    
    // Right vertical path (top to bottom) - 13 cells
    for (let i = 1; i < 13; i++) {
      path.push({ x: 18, y: 6 + i });
    }
    
    // Bottom horizontal path (right to left) - 13 cells
    for (let i = 12; i >= 0; i--) {
      path.push({ x: 6 + i, y: 18 });
    }
    
    // Left vertical path (bottom to top) - 13 cells
    for (let i = 12; i >= 1; i--) {
      path.push({ x: 6, y: 6 + i });
    }
    
    return path;
  };

  // Home positions (4 tokens per player in corners)
  const getHomePositions = (color) => {
    const homes = {
      red: [
        { x: 1, y: 1 }, { x: 4, y: 1 }, { x: 1, y: 4 }, { x: 4, y: 4 }
      ],
      blue: [
        { x: 20, y: 20 }, { x: 23, y: 20 }, { x: 20, y: 23 }, { x: 23, y: 23 }
      ],
      green: [
        { x: 20, y: 1 }, { x: 23, y: 1 }, { x: 20, y: 4 }, { x: 23, y: 4 }
      ],
      yellow: [
        { x: 1, y: 20 }, { x: 4, y: 20 }, { x: 1, y: 23 }, { x: 4, y: 23 }
      ],
    };
    return homes[color] || [];
  };

  // Safe positions
  const getSafePositions = () => [0, 8, 13, 21, 26, 34, 39, 47];

  // Draw board
  const drawBoard = (ctx) => {
    // White background
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);

    // Draw colored home areas (corners)
    drawHomeArea(ctx, 'red', 0, 0, 160);
    drawHomeArea(ctx, 'green', 640, 0, 160);
    drawHomeArea(ctx, 'blue', 640, 640, 160);
    drawHomeArea(ctx, 'yellow', 0, 640, 160);

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

      // Safe spot with star
      if (safePositions.includes(idx)) {
        ctx.fillStyle = COLORS.gold;
        ctx.beginPath();
        ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE / 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = COLORS.white;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', x + CELL_SIZE / 2, y + CELL_SIZE / 2);
      }
    });

    // Center finish area
    ctx.fillStyle = COLORS.gold;
    ctx.beginPath();
    ctx.arc(BOARD_SIZE / 2, BOARD_SIZE / 2, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 4;
    ctx.stroke();
    
    ctx.fillStyle = COLORS.white;
    ctx.font = 'bold 50px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏆', BOARD_SIZE / 2, BOARD_SIZE / 2);
  };

  // Draw home area
  const drawHomeArea = (ctx, color, startX, startY, size) => {
    // Colored background
    ctx.fillStyle = COLORS[color];
    ctx.fillRect(startX, startY, size, size);
    
    // White inner area for tokens
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(startX + 10, startY + 10, size - 20, size - 20);
    
    // Border
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 3;
    ctx.strokeRect(startX, startY, size, size);
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
          // Finish area - arrange in circle
          const angle = (idx * Math.PI * 2) / 4 - Math.PI / 2;
          x = BOARD_SIZE / 2 + Math.cos(angle) * 35;
          y = BOARD_SIZE / 2 + Math.sin(angle) * 35;
        }

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
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
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(idx + 1, x, y);

        // Highlight available moves
        if (availableMoves.includes(idx) && gameState.currentPlayer?.id === playerId) {
          ctx.strokeStyle = '#2ECC71';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(x, y, TOKEN_RADIUS + 10, 0, Math.PI * 2);
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
        tokenX = BOARD_SIZE / 2 + Math.cos(angle) * 35;
        tokenY = BOARD_SIZE / 2 + Math.sin(angle) * 35;
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
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-black">
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
      <div className="mt-8 w-full max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  className="w-6 h-6 rounded-full border-3 border-white shadow-md"
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
