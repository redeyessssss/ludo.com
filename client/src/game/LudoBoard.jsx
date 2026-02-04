import { useEffect, useRef, useState } from 'react';

export default function LudoBoard({ gameState, onTokenClick, onDiceRoll, currentUserId, availableMoves = [] }) {
  const canvasRef = useRef(null);

  const BOARD_SIZE = 900;
  const CELL_SIZE = 60;
  const TOKEN_RADIUS = 22;
  
  const COLORS = {
    red: '#E74C3C',
    blue: '#3498DB',
    green: '#2ECC71',
    yellow: '#F1C40F',
    white: '#FFFFFF',
    black: '#2C3E50',
    lightGray: '#ECF0F1',
  };

  // Get board path (52 cells)
  const getBoardPath = () => {
    const path = [];
    
    // Starting from red's entry point, going clockwise
    // Left column going down (6 cells)
    for (let i = 0; i < 6; i++) {
      path.push({ x: 0, y: 6 + i, color: null });
    }
    
    // Bottom-left corner (1 cell) - Yellow start
    path.push({ x: 0, y: 12, color: 'yellow' });
    
    // Bottom row going right (5 cells)
    for (let i = 1; i < 6; i++) {
      path.push({ x: i, y: 12, color: null });
    }
    
    // Yellow home column (5 cells going up)
    for (let i = 0; i < 5; i++) {
      path.push({ x: 6, y: 12 - i, color: 'yellow' });
    }
    
    // Continue bottom row (6 cells)
    for (let i = 7; i < 13; i++) {
      path.push({ x: i, y: 12, color: null });
    }
    
    // Bottom-right corner (1 cell) - Blue start
    path.push({ x: 12, y: 12, color: 'blue' });
    
    // Right column going up (5 cells)
    for (let i = 11; i > 6; i--) {
      path.push({ x: 12, y: i, color: null });
    }
    
    // Blue home row (5 cells going left)
    for (let i = 0; i < 5; i++) {
      path.push({ x: 12 - i, y: 6, color: 'blue' });
    }
    
    // Continue right column (6 cells)
    for (let i = 5; i >= 0; i--) {
      path.push({ x: 12, y: i, color: null });
    }
    
    // Top-right corner (1 cell) - Green start
    path.push({ x: 12, y: 0, color: 'green' });
    
    // Top row going left (5 cells)
    for (let i = 11; i > 6; i--) {
      path.push({ x: i, y: 0, color: null });
    }
    
    // Green home column (5 cells going down)
    for (let i = 0; i < 5; i++) {
      path.push({ x: 6, y: i, color: 'green' });
    }
    
    // Continue top row (6 cells)
    for (let i = 5; i >= 0; i--) {
      path.push({ x: i, y: 0, color: null });
    }
    
    // Top-left corner (1 cell) - Red start
    path.push({ x: 0, y: 0, color: 'red' });
    
    // Left column going down (5 cells)
    for (let i = 1; i < 6; i++) {
      path.push({ x: 0, y: i, color: null });
    }
    
    // Red home row (5 cells going right)
    for (let i = 0; i < 5; i++) {
      path.push({ x: i, y: 6, color: 'red' });
    }
    
    return path;
  };

  // Home positions
  const getHomePositions = (color) => {
    const homes = {
      red: [
        { x: 1.5, y: 1.5 }, { x: 4, y: 1.5 }, { x: 1.5, y: 4 }, { x: 4, y: 4 }
      ],
      green: [
        { x: 8.5, y: 1.5 }, { x: 11, y: 1.5 }, { x: 8.5, y: 4 }, { x: 11, y: 4 }
      ],
      blue: [
        { x: 8.5, y: 8.5 }, { x: 11, y: 8.5 }, { x: 8.5, y: 11 }, { x: 11, y: 11 }
      ],
      yellow: [
        { x: 1.5, y: 8.5 }, { x: 4, y: 8.5 }, { x: 1.5, y: 11 }, { x: 4, y: 11 }
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

    // Draw home areas (large colored squares in corners)
    // Red (top-left)
    ctx.fillStyle = COLORS.red;
    ctx.fillRect(0, 0, 360, 360);
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(30, 30, 300, 300);
    
    // Green (top-right)
    ctx.fillStyle = COLORS.green;
    ctx.fillRect(540, 0, 360, 360);
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(570, 30, 300, 300);
    
    // Blue (bottom-right)
    ctx.fillStyle = COLORS.blue;
    ctx.fillRect(540, 540, 360, 360);
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(570, 570, 300, 300);
    
    // Yellow (bottom-left)
    ctx.fillStyle = COLORS.yellow;
    ctx.fillRect(0, 540, 360, 360);
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(30, 570, 300, 300);

    // Draw main path
    const path = getBoardPath();
    const safePositions = getSafePositions();

    path.forEach((pos, idx) => {
      const x = pos.x * CELL_SIZE + (pos.x >= 6 ? 180 : 0);
      const y = pos.y * CELL_SIZE + (pos.y >= 6 ? 180 : 0);
      
      // Cell background
      if (pos.color) {
        ctx.fillStyle = COLORS[pos.color];
      } else {
        ctx.fillStyle = COLORS.white;
      }
      ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
      
      // Cell border
      ctx.strokeStyle = COLORS.black;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

      // Safe spot
      if (safePositions.includes(idx)) {
        ctx.fillStyle = COLORS.yellow;
        ctx.beginPath();
        ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = COLORS.white;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', x + CELL_SIZE / 2, y + CELL_SIZE / 2);
      }
    });

    // Center finish area
    ctx.fillStyle = COLORS.yellow;
    ctx.beginPath();
    ctx.arc(BOARD_SIZE / 2, BOARD_SIZE / 2, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 4;
    ctx.stroke();
    
    ctx.fillStyle = COLORS.white;
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏆', BOARD_SIZE / 2, BOARD_SIZE / 2);
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
          x = homePos.x * CELL_SIZE + (homePos.x >= 6 ? 180 : 0);
          y = homePos.y * CELL_SIZE + (homePos.y >= 6 ? 180 : 0);
        } else if (token.position >= 0 && token.position < path.length) {
          const pos = path[token.position];
          x = pos.x * CELL_SIZE + (pos.x >= 6 ? 180 : 0) + CELL_SIZE / 2;
          y = pos.y * CELL_SIZE + (pos.y >= 6 ? 180 : 0) + CELL_SIZE / 2;
        } else {
          // Finish area
          const angle = (idx * Math.PI * 2) / 4 - Math.PI / 2;
          x = BOARD_SIZE / 2 + Math.cos(angle) * 45;
          y = BOARD_SIZE / 2 + Math.sin(angle) * 45;
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
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(idx + 1, x, y);

        // Highlight available
        if (availableMoves.includes(idx) && gameState.currentPlayer?.id === playerId) {
          ctx.strokeStyle = '#2ECC71';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(x, y, TOKEN_RADIUS + 12, 0, Math.PI * 2);
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
        tokenX = homePos.x * CELL_SIZE + (homePos.x >= 6 ? 180 : 0);
        tokenY = homePos.y * CELL_SIZE + (homePos.y >= 6 ? 180 : 0);
      } else if (token.position >= 0 && token.position < path.length) {
        const pos = path[token.position];
        tokenX = pos.x * CELL_SIZE + (pos.x >= 6 ? 180 : 0) + CELL_SIZE / 2;
        tokenY = pos.y * CELL_SIZE + (pos.y >= 6 ? 180 : 0) + CELL_SIZE / 2;
      } else {
        const angle = (idx * Math.PI * 2) / 4 - Math.PI / 2;
        tokenX = BOARD_SIZE / 2 + Math.cos(angle) * 45;
        tokenY = BOARD_SIZE / 2 + Math.sin(angle) * 45;
      }

      const distance = Math.sqrt((x - tokenX) ** 2 + (y - tokenY) ** 2);
      if (distance < TOKEN_RADIUS + 15 && availableMoves.includes(idx)) {
        onTokenClick(idx);
      }
    });
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
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
