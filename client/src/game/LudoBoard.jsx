import { useEffect, useRef } from 'react';

export default function LudoBoard({ gameState, onTokenClick, currentUserId, availableMoves = [] }) {
  const canvasRef = useRef(null);

  const BOARD_SIZE = 900;
  const CELL_SIZE = 60;
  const TOKEN_RADIUS = 22;
  
  const COLORS = {
    red: '#E53935',
    blue: '#1E88E5',
    green: '#43A047',
    yellow: '#FDD835',
    white: '#FFFFFF',
    black: '#000000',
    lightGray: '#F5F5F5',
  };

  // Traditional Ludo board is 15x15 grid
  // Get board path (52 cells) - clockwise from red start
  const getBoardPath = () => {
    const path = [];
    
    // RED START - Position 0 (row 6, col 1)
    path.push({ x: 1, y: 6 });
    
    // Left column going UP (positions 1-5)
    for (let i = 5; i >= 1; i--) {
      path.push({ x: 0, y: i });
    }
    
    // Top-left corner going RIGHT (positions 6-7)
    path.push({ x: 1, y: 0 });
    path.push({ x: 2, y: 0 });
    path.push({ x: 3, y: 0 });
    path.push({ x: 4, y: 0 });
    path.push({ x: 5, y: 0 });
    
    // GREEN START - Position 13 (row 0, col 6)
    path.push({ x: 6, y: 0 });
    
    // Top row going RIGHT (positions 14-18)
    path.push({ x: 7, y: 0 });
    path.push({ x: 8, y: 0 });
    path.push({ x: 9, y: 0 });
    path.push({ x: 10, y: 0 });
    path.push({ x: 11, y: 0 });
    path.push({ x: 12, y: 0 });
    
    // Top-right corner going DOWN (positions 19-20)
    path.push({ x: 12, y: 1 });
    path.push({ x: 12, y: 2 });
    path.push({ x: 12, y: 3 });
    path.push({ x: 12, y: 4 });
    path.push({ x: 12, y: 5 });
    
    // BLUE START - Position 26 (row 6, col 12)
    path.push({ x: 12, y: 6 });
    
    // Right column going DOWN (positions 27-31)
    path.push({ x: 12, y: 7 });
    path.push({ x: 12, y: 8 });
    path.push({ x: 12, y: 9 });
    path.push({ x: 12, y: 10 });
    path.push({ x: 12, y: 11 });
    path.push({ x: 12, y: 12 });
    
    // Bottom-right corner going LEFT (positions 32-33)
    path.push({ x: 11, y: 12 });
    path.push({ x: 10, y: 12 });
    path.push({ x: 9, y: 12 });
    path.push({ x: 8, y: 12 });
    path.push({ x: 7, y: 12 });
    
    // YELLOW START - Position 39 (row 12, col 6)
    path.push({ x: 6, y: 12 });
    
    // Bottom row going LEFT (positions 40-44)
    path.push({ x: 5, y: 12 });
    path.push({ x: 4, y: 12 });
    path.push({ x: 3, y: 12 });
    path.push({ x: 2, y: 12 });
    path.push({ x: 1, y: 12 });
    path.push({ x: 0, y: 12 });
    
    // Bottom-left corner going UP (positions 45-51)
    path.push({ x: 0, y: 11 });
    path.push({ x: 0, y: 10 });
    path.push({ x: 0, y: 9 });
    path.push({ x: 0, y: 8 });
    path.push({ x: 0, y: 7 });
    
    return path;
  };

  // Home paths (colored paths leading to center)
  const getHomePaths = () => {
    return {
      red: [
        { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 }
      ],
      green: [
        { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 6, y: 4 }, { x: 6, y: 5 }
      ],
      blue: [
        { x: 11, y: 6 }, { x: 10, y: 6 }, { x: 9, y: 6 }, { x: 8, y: 6 }, { x: 7, y: 6 }
      ],
      yellow: [
        { x: 6, y: 11 }, { x: 6, y: 10 }, { x: 6, y: 9 }, { x: 6, y: 8 }, { x: 6, y: 7 }
      ],
    };
  };

  // Home positions for tokens (in colored home areas)
  const getHomePositions = (color) => {
    const homes = {
      red: [
        { x: 1.5, y: 1.5 }, { x: 4, y: 1.5 }, { x: 1.5, y: 4 }, { x: 4, y: 4 }
      ],
      green: [
        { x: 8, y: 1.5 }, { x: 10.5, y: 1.5 }, { x: 8, y: 4 }, { x: 10.5, y: 4 }
      ],
      blue: [
        { x: 8, y: 8 }, { x: 10.5, y: 8 }, { x: 8, y: 10.5 }, { x: 10.5, y: 10.5 }
      ],
      yellow: [
        { x: 1.5, y: 8 }, { x: 4, y: 8 }, { x: 1.5, y: 10.5 }, { x: 4, y: 10.5 }
      ],
    };
    return homes[color] || [];
  };

  // Safe positions (star positions) - starting positions for each color
  const getSafePositions = () => [0, 8, 13, 21, 26, 34, 39, 47];

  // Draw board
  const drawBoard = (ctx) => {
    // Background
    ctx.fillStyle = COLORS.lightGray;
    ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);

    // Draw 15x15 grid
    for (let row = 0; row < 13; row++) {
      for (let col = 0; col < 13; col++) {
        const x = col * CELL_SIZE + (col >= 6 ? 180 : 0);
        const y = row * CELL_SIZE + (row >= 6 ? 180 : 0);
        
        // Default white cells
        ctx.fillStyle = COLORS.white;
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = COLORS.black;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
      }
    }

    // Draw home areas (large colored squares in corners)
    // Red (top-left)
    ctx.fillStyle = COLORS.red;
    ctx.fillRect(0, 0, 360, 360);
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(40, 40, 280, 280);
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 360, 360);
    ctx.strokeRect(40, 40, 280, 280);
    
    // Green (top-right)
    ctx.fillStyle = COLORS.green;
    ctx.fillRect(540, 0, 360, 360);
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(580, 40, 280, 280);
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 4;
    ctx.strokeRect(540, 0, 360, 360);
    ctx.strokeRect(580, 40, 280, 280);
    
    // Blue (bottom-right)
    ctx.fillStyle = COLORS.blue;
    ctx.fillRect(540, 540, 360, 360);
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(580, 580, 280, 280);
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 4;
    ctx.strokeRect(540, 540, 360, 360);
    ctx.strokeRect(580, 580, 280, 280);
    
    // Yellow (bottom-left)
    ctx.fillStyle = COLORS.yellow;
    ctx.fillRect(0, 540, 360, 360);
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(40, 580, 280, 280);
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 540, 360, 360);
    ctx.strokeRect(40, 580, 280, 280);

    // Draw home paths (colored paths leading to center)
    const homePaths = getHomePaths();
    Object.keys(homePaths).forEach(color => {
      ctx.fillStyle = COLORS[color];
      homePaths[color].forEach(pos => {
        const x = pos.x * CELL_SIZE + (pos.x >= 6 ? 180 : 0);
        const y = pos.y * CELL_SIZE + (pos.y >= 6 ? 180 : 0);
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = COLORS.black;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
      });
    });

    // Draw main path with safe spots
    const path = getBoardPath();
    const safePositions = getSafePositions();

    path.forEach((pos, idx) => {
      const x = pos.x * CELL_SIZE + (pos.x >= 6 ? 180 : 0);
      const y = pos.y * CELL_SIZE + (pos.y >= 6 ? 180 : 0);
      
      // Cell border
      ctx.strokeStyle = COLORS.black;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

      // Safe spot (star) - draw on starting positions
      if (safePositions.includes(idx)) {
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', x + CELL_SIZE / 2, y + CELL_SIZE / 2);
      }
    });

    // Center finish area (triangle pattern)
    const centerX = BOARD_SIZE / 2;
    const centerY = BOARD_SIZE / 2;
    const triangleSize = 90;
    
    // Draw colored triangles meeting at center
    // Red triangle (left, pointing right)
    ctx.fillStyle = COLORS.red;
    ctx.beginPath();
    ctx.moveTo(centerX - triangleSize, centerY - triangleSize);
    ctx.lineTo(centerX, centerY);
    ctx.lineTo(centerX - triangleSize, centerY + triangleSize);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Green triangle (top, pointing down)
    ctx.fillStyle = COLORS.green;
    ctx.beginPath();
    ctx.moveTo(centerX - triangleSize, centerY - triangleSize);
    ctx.lineTo(centerX, centerY);
    ctx.lineTo(centerX + triangleSize, centerY - triangleSize);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Yellow triangle (bottom, pointing up)
    ctx.fillStyle = COLORS.yellow;
    ctx.beginPath();
    ctx.moveTo(centerX - triangleSize, centerY + triangleSize);
    ctx.lineTo(centerX, centerY);
    ctx.lineTo(centerX + triangleSize, centerY + triangleSize);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Blue triangle (right, pointing left)
    ctx.fillStyle = COLORS.blue;
    ctx.beginPath();
    ctx.moveTo(centerX + triangleSize, centerY - triangleSize);
    ctx.lineTo(centerX, centerY);
    ctx.lineTo(centerX + triangleSize, centerY + triangleSize);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Center circle with trophy
    ctx.fillStyle = COLORS.yellow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Trophy
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏆', centerX, centerY);
  };

  // Draw tokens
  const drawTokens = (ctx) => {
    if (!gameState || !gameState.tokens) return;

    const path = getBoardPath();
    const homePaths = getHomePaths();

    Object.keys(gameState.tokens).forEach(playerId => {
      const playerTokens = gameState.tokens[playerId];
      const color = playerTokens.color;

      playerTokens.tokens.forEach((token, idx) => {
        let x, y;

        if (token.isHome) {
          // Token in home area
          const homePos = getHomePositions(color)[idx];
          x = homePos.x * CELL_SIZE + (homePos.x >= 6 ? 180 : 0);
          y = homePos.y * CELL_SIZE + (homePos.y >= 6 ? 180 : 0);
        } else if (token.position >= 0 && token.position < 52) {
          // Token on main path
          const pos = path[token.position];
          x = pos.x * CELL_SIZE + (pos.x >= 6 ? 180 : 0) + CELL_SIZE / 2;
          y = pos.y * CELL_SIZE + (pos.y >= 6 ? 180 : 0) + CELL_SIZE / 2;
        } else if (token.position >= 52) {
          // Token in finish area (home path)
          const homePathIndex = token.position - 52;
          if (homePathIndex < 5) {
            const pos = homePaths[color][homePathIndex];
            x = pos.x * CELL_SIZE + (pos.x >= 6 ? 180 : 0) + CELL_SIZE / 2;
            y = pos.y * CELL_SIZE + (pos.y >= 6 ? 180 : 0) + CELL_SIZE / 2;
          } else {
            // Token finished - place in center
            const angle = (idx * Math.PI * 2) / 4 - Math.PI / 2;
            x = BOARD_SIZE / 2 + Math.cos(angle) * 25;
            y = BOARD_SIZE / 2 + Math.sin(angle) * 25;
          }
        } else {
          // Fallback
          const angle = (idx * Math.PI * 2) / 4 - Math.PI / 2;
          x = BOARD_SIZE / 2 + Math.cos(angle) * 25;
          y = BOARD_SIZE / 2 + Math.sin(angle) * 25;
        }

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(x + 3, y + 3, TOKEN_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Token
        ctx.fillStyle = COLORS[color];
        ctx.beginPath();
        ctx.arc(x, y, TOKEN_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = COLORS.black;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Number
        ctx.fillStyle = COLORS.white;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(idx + 1, x, y);

        // Highlight available moves
        if (availableMoves.includes(idx) && gameState.currentPlayer?.id === currentUserId) {
          ctx.strokeStyle = '#00FF00';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(x, y, TOKEN_RADIUS + 10, 0, Math.PI * 2);
          ctx.stroke();
          
          // Pulsing effect
          ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(x, y, TOKEN_RADIUS + 15, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    drawBoard(ctx);
    drawTokens(ctx);
  }, [gameState, availableMoves]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (!gameState || !gameState.tokens || gameState.currentPlayer?.id !== currentUserId) return;

    const playerTokens = gameState.tokens[currentUserId];
    if (!playerTokens) return;

    const path = getBoardPath();
    const homePaths = getHomePaths();

    playerTokens.tokens.forEach((token, idx) => {
      let tokenX, tokenY;

      if (token.isHome) {
        const homePos = getHomePositions(playerTokens.color)[idx];
        tokenX = homePos.x * CELL_SIZE + (homePos.x >= 6 ? 180 : 0);
        tokenY = homePos.y * CELL_SIZE + (homePos.y >= 6 ? 180 : 0);
      } else if (token.position >= 0 && token.position < 52) {
        const pos = path[token.position];
        tokenX = pos.x * CELL_SIZE + (pos.x >= 6 ? 180 : 0) + CELL_SIZE / 2;
        tokenY = pos.y * CELL_SIZE + (pos.y >= 6 ? 180 : 0) + CELL_SIZE / 2;
      } else if (token.position >= 52) {
        const homePathIndex = token.position - 52;
        if (homePathIndex < 5) {
          const pos = homePaths[playerTokens.color][homePathIndex];
          tokenX = pos.x * CELL_SIZE + (pos.x >= 6 ? 180 : 0) + CELL_SIZE / 2;
          tokenY = pos.y * CELL_SIZE + (pos.y >= 6 ? 180 : 0) + CELL_SIZE / 2;
        } else {
          const angle = (idx * Math.PI * 2) / 4 - Math.PI / 2;
          tokenX = BOARD_SIZE / 2 + Math.cos(angle) * 25;
          tokenY = BOARD_SIZE / 2 + Math.sin(angle) * 25;
        }
      } else {
        const angle = (idx * Math.PI * 2) / 4 - Math.PI / 2;
        tokenX = BOARD_SIZE / 2 + Math.cos(angle) * 25;
        tokenY = BOARD_SIZE / 2 + Math.sin(angle) * 25;
      }

      const distance = Math.sqrt((x - tokenX) ** 2 + (y - tokenY) ** 2);
      if (distance < TOKEN_RADIUS + 15 && availableMoves.includes(idx)) {
        onTokenClick(idx);
      }
    });
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden border-4 border-black">
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
                  style={{ backgroundColor: COLORS[playerTokens?.color] }}
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
