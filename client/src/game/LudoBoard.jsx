import { useEffect, useRef, useState } from 'react';

export default function LudoBoard({ gameState, onTokenClick, onDiceRoll, currentUserId, availableMoves = [] }) {
  const canvasRef = useRef(null);
  const [selectedToken, setSelectedToken] = useState(null);

  // Board configuration
  const BOARD_SIZE = 600;
  const CELL_SIZE = 30;
  const TOKEN_RADIUS = 14;
  
  const COLORS = {
    red: '#e74c3c',
    blue: '#3498db',
    green: '#2ecc71',
    yellow: '#f1c40f',
    white: '#ffffff',
    black: '#000000',
    lightGray: '#ecf0f1',
    darkGray: '#95a5a6',
    gold: '#f39c12',
  };

  // Get board path positions (52 cells)
  const getBoardPath = () => {
    const path = [];
    
    // Top row (left to right) - 13 cells
    for (let i = 0; i < 13; i++) {
      path.push({ x: 6 + i, y: 6 });
    }
    
    // Right column (top to bottom) - 13 cells
    for (let i = 1; i < 13; i++) {
      path.push({ x: 18, y: 6 + i });
    }
    
    // Bottom row (right to left) - 13 cells
    for (let i = 12; i >= 0; i--) {
      path.push({ x: 6 + i, y: 18 });
    }
    
    // Left column (bottom to top) - 13 cells
    for (let i = 12; i >= 1; i--) {
      path.push({ x: 6, y: 6 + i });
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
        { x: 20, y: 1 }, { x: 23, y: 1 }, { x: 20, y: 4 }, { x: 23, y: 4 }
      ],
      green: [
        { x: 20, y: 20 }, { x: 23, y: 20 }, { x: 20, y: 23 }, { x: 23, y: 23 }
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
    // Clear canvas
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);

    // Draw border
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, BOARD_SIZE, BOARD_SIZE);

    // Draw home areas with colors
    drawHomeArea(ctx, 'red', 0, 0);
    drawHomeArea(ctx, 'blue', 540, 0);
    drawHomeArea(ctx, 'green', 540, 540);
    drawHomeArea(ctx, 'yellow', 0, 540);

    // Draw main path
    const path = getBoardPath();
    const safePositions = getSafePositions();

    path.forEach((pos, idx) => {
      const x = pos.x * CELL_SIZE;
      const y = pos.y * CELL_SIZE;
      
      // Draw cell background
      ctx.fillStyle = COLORS.lightGray;
      ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
      
      // Draw cell border
      ctx.strokeStyle = COLORS.darkGray;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

      // Draw safe spot
      if (safePositions.includes(idx)) {
        ctx.fillStyle = COLORS.gold;
        ctx.beginPath();
        ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = COLORS.white;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', x + CELL_SIZE / 2, y + CELL_SIZE / 2);
      }
    });

    // Draw center finish area
    ctx.fillStyle = COLORS.gold;
    ctx.beginPath();
    ctx.arc(BOARD_SIZE / 2, BOARD_SIZE / 2, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = COLORS.white;
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏆', BOARD_SIZE / 2, BOARD_SIZE / 2);
  };

  // Draw home area
  const drawHomeArea = (ctx, color, startX, startY) => {
    ctx.fillStyle = COLORS[color];
    ctx.globalAlpha = 0.15;
    ctx.fillRect(startX, startY, 120, 120);
    ctx.globalAlpha = 1;
    
    ctx.strokeStyle = COLORS[color];
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, 120, 120);
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
          const angle = (idx * Math.PI * 2) / 4;
          x = BOARD_SIZE / 2 + Math.cos(angle) * 25;
          y = BOARD_SIZE / 2 + Math.sin(angle) * 25;
        }

        // Draw token shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(x + 2, y + 2, TOKEN_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Draw token
        ctx.fillStyle = COLORS[color];
        ctx.beginPath();
        ctx.arc(x, y, TOKEN_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Draw token border
        ctx.strokeStyle = COLORS.white;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Draw token number
        ctx.fillStyle = COLORS.white;
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(idx + 1, x, y);

        // Highlight available moves
        if (availableMoves.includes(idx) && gameState.currentPlayer?.id === playerId) {
          ctx.strokeStyle = '#2ecc71';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(x, y, TOKEN_RADIUS + 6, 0, Math.PI * 2);
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

  // Handle canvas click
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
        const angle = (idx * Math.PI * 2) / 4;
        tokenX = BOARD_SIZE / 2 + Math.cos(angle) * 25;
        tokenY = BOARD_SIZE / 2 + Math.sin(angle) * 25;
      }

      const distance = Math.sqrt((x - tokenX) ** 2 + (y - tokenY) ** 2);
      if (distance < TOKEN_RADIUS + 10 && availableMoves.includes(idx)) {
        onTokenClick(idx);
      }
    });
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Canvas Board */}
      <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden border-4 border-gray-800">
        <canvas
          ref={canvasRef}
          width={BOARD_SIZE}
          height={BOARD_SIZE}
          onClick={handleCanvasClick}
          className="cursor-pointer"
          style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
        />
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
                  style={{ backgroundColor: playerTokens?.color }}
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
