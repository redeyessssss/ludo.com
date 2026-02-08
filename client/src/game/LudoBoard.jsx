import { useEffect, useRef } from 'react';

// VERSION 5.0.5 - Dice positioned at center of board
// CONSTANTS & CONFIG
const MAIN_PATH_LENGTH = 52;
const SAFE_CELLS = [0, 8, 13, 21, 26, 34, 39, 47];
const PLAYER_CONFIG = {
  red:    { start: 0,  entry: 50, homeStart: 100 },
  green:  { start: 13, entry: 11, homeStart: 200 },
  yellow: { start: 26, entry: 24, homeStart: 300 },
  blue:   { start: 39, entry: 37, homeStart: 400 }
};
const HOME_PATH_LENGTH = 6;
const FINISH_OFFSET = 5;

export default function LudoBoard({ gameState, onTokenClick, currentUserId, availableMoves = [] }) {
  const canvasRef = useRef(null);

  const BOARD_SIZE = 900;
  const CELL_SIZE = 60;
  const TOKEN_RADIUS = 22;
  
  // EXACT colors from reference image
  const COLORS = {
    red: '#E53935',        // Bright red
    green: '#43A047',      // Bright green
    blue: '#1E88E5',       // Bright blue
    yellow: '#FDD835',     // Bright yellow
    white: '#FFFFFF',      // Pure white
    black: '#000000',      // Black for lines
    tokenRed: '#D32F2F',
    tokenGreen: '#388E3C',
    tokenBlue: '#1976D2',
    tokenYellow: '#F9A825',
  };

  // Get the 52-cell main path (clockwise from red start)
  // Board is 15x15 grid (0-14), with cross at rows/cols 6,7,8
  const getMainPath = () => {
    const path = [];
    
    // RED START (position 0) - middle of left cross, row 7, col 1
    path.push({ x: 1, y: 7 });
    
    // Left column going UP (positions 1-5) - col 0, rows 6 down to 2
    for (let i = 6; i >= 2; i--) {
      path.push({ x: 0, y: i });
    }
    
    // Top-left corner (position 6)
    path.push({ x: 0, y: 1 });
    path.push({ x: 0, y: 0 });
    
    // Top row going RIGHT (positions 8-12) - row 0, cols 1-5
    for (let i = 1; i <= 5; i++) {
      path.push({ x: i, y: 0 });
    }
    
    // GREEN START (position 13) - middle of top cross, row 1, col 7
    path.push({ x: 6, y: 0 });
    path.push({ x: 7, y: 0 });
    path.push({ x: 7, y: 1 });
    
    // Top row continuing RIGHT (positions 16-20) - row 0, cols 8-12
    path.push({ x: 8, y: 0 });
    for (let i = 9; i <= 13; i++) {
      path.push({ x: i, y: 0 });
    }
    
    // Top-right corner (positions 21-22)
    path.push({ x: 14, y: 0 });
    path.push({ x: 14, y: 1 });
    
    // Right column going DOWN (positions 23-25) - col 14, rows 2-6
    for (let i = 2; i <= 6; i++) {
      path.push({ x: 14, y: i });
    }
    
    // BLUE START (position 26) - middle of right cross, row 7, col 13
    path.push({ x: 14, y: 7 });
    path.push({ x: 13, y: 7 });
    
    // Right column continuing DOWN (positions 28-32) - col 14, rows 8-12
    path.push({ x: 14, y: 8 });
    for (let i = 9; i <= 13; i++) {
      path.push({ x: 14, y: i });
    }
    
    // Bottom-right corner (positions 33-34)
    path.push({ x: 14, y: 14 });
    path.push({ x: 13, y: 14 });
    
    // Bottom row going LEFT (positions 35-38) - row 14, cols 12-8
    for (let i = 12; i >= 8; i--) {
      path.push({ x: i, y: 14 });
    }
    
    // YELLOW START (position 39) - middle of bottom cross, row 13, col 7
    path.push({ x: 7, y: 14 });
    path.push({ x: 7, y: 13 });
    
    // Bottom row continuing LEFT (positions 41-45) - row 14, cols 6-2
    path.push({ x: 6, y: 14 });
    for (let i = 5; i >= 1; i--) {
      path.push({ x: i, y: 14 });
    }
    
    // Bottom-left corner (positions 46-47)
    path.push({ x: 0, y: 14 });
    path.push({ x: 0, y: 13 });
    
    // Left column going UP back to start (positions 48-51) - col 0, rows 12-8
    for (let i = 12; i >= 8; i--) {
      path.push({ x: 0, y: i });
    }
    
    // Position 52 would wrap back to position 0
    
    return path;
  };

  // Home paths (colored paths leading to center)
  const getHomePaths = () => {
    return {
      red: [
        { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }
      ],
      green: [
        { x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 }, { x: 7, y: 6 }
      ],
      yellow: [
        { x: 7, y: 13 }, { x: 7, y: 12 }, { x: 7, y: 11 }, { x: 7, y: 10 }, { x: 7, y: 9 }, { x: 7, y: 8 }
      ],
      blue: [
        { x: 13, y: 7 }, { x: 12, y: 7 }, { x: 11, y: 7 }, { x: 10, y: 7 }, { x: 9, y: 7 }, { x: 8, y: 7 }
      ],
    };
  };

  // Home positions for tokens (in colored home areas) - updated for 15x15 grid
  const getHomePositions = (color) => {
    const homes = {
      red: [
        { x: 2, y: 2 }, { x: 4, y: 2 }, { x: 2, y: 4 }, { x: 4, y: 4 }
      ],
      green: [
        { x: 10, y: 2 }, { x: 12, y: 2 }, { x: 10, y: 4 }, { x: 12, y: 4 }
      ],
      blue: [
        { x: 2, y: 10 }, { x: 4, y: 10 }, { x: 2, y: 12 }, { x: 4, y: 12 }
      ],
      yellow: [
        { x: 10, y: 10 }, { x: 12, y: 10 }, { x: 10, y: 12 }, { x: 12, y: 12 }
      ],
    };
    return homes[color] || [];
  };

  // Draw the board EXACTLY like the reference image
  const drawBoard = (ctx) => {
    // White background
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);

    // Reference image structure:
    // - 4 corner boxes (6x6 cells each) at positions (0,0), (9,0), (0,9), (9,9)
    // - Cross-shaped path between them (3 cells wide)
    // - Path cells are at rows 6,7,8 and columns 6,7,8
    // - The boxes do NOT overlap the path
    
    // Draw ALL white path cells in cross shape FIRST
    // Horizontal bar (rows 6,7,8 - full width from 0 to 14)
    for (let row = 6; row <= 8; row++) {
      for (let col = 0; col <= 14; col++) {
        ctx.fillStyle = COLORS.white;
        ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = COLORS.black;
        ctx.lineWidth = 2;
        ctx.strokeRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
    
    // Vertical bar (columns 6,7,8 - full height from 0 to 14)
    for (let col = 6; col <= 8; col++) {
      for (let row = 0; row <= 14; row++) {
        ctx.fillStyle = COLORS.white;
        ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = COLORS.black;
        ctx.lineWidth = 2;
        ctx.strokeRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }

    // Now draw the 4 corner home boxes (they sit in the corners, NOT overlapping the cross)
    // RED (top-left) - rows 0-5, cols 0-5
    ctx.fillStyle = COLORS.red;
    ctx.fillRect(0, 0, 6 * CELL_SIZE, 6 * CELL_SIZE);
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(CELL_SIZE, CELL_SIZE, 4 * CELL_SIZE, 4 * CELL_SIZE);
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, 6 * CELL_SIZE, 6 * CELL_SIZE);
    ctx.strokeRect(CELL_SIZE, CELL_SIZE, 4 * CELL_SIZE, 4 * CELL_SIZE);
    
    // GREEN (top-right) - rows 0-5, cols 9-14
    ctx.fillStyle = COLORS.green;
    ctx.fillRect(9 * CELL_SIZE, 0, 6 * CELL_SIZE, 6 * CELL_SIZE);
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(10 * CELL_SIZE, CELL_SIZE, 4 * CELL_SIZE, 4 * CELL_SIZE);
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 3;
    ctx.strokeRect(9 * CELL_SIZE, 0, 6 * CELL_SIZE, 6 * CELL_SIZE);
    ctx.strokeRect(10 * CELL_SIZE, CELL_SIZE, 4 * CELL_SIZE, 4 * CELL_SIZE);
    
    // YELLOW (bottom-left) - rows 9-14, cols 0-5
    ctx.fillStyle = COLORS.yellow;
    ctx.fillRect(0, 9 * CELL_SIZE, 6 * CELL_SIZE, 6 * CELL_SIZE);
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(CELL_SIZE, 10 * CELL_SIZE, 4 * CELL_SIZE, 4 * CELL_SIZE);
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 9 * CELL_SIZE, 6 * CELL_SIZE, 6 * CELL_SIZE);
    ctx.strokeRect(CELL_SIZE, 10 * CELL_SIZE, 4 * CELL_SIZE, 4 * CELL_SIZE);
    
    // BLUE (bottom-right) - rows 9-14, cols 9-14
    ctx.fillStyle = COLORS.blue;
    ctx.fillRect(9 * CELL_SIZE, 9 * CELL_SIZE, 6 * CELL_SIZE, 6 * CELL_SIZE);
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(10 * CELL_SIZE, 10 * CELL_SIZE, 4 * CELL_SIZE, 4 * CELL_SIZE);
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 3;
    ctx.strokeRect(9 * CELL_SIZE, 9 * CELL_SIZE, 6 * CELL_SIZE, 6 * CELL_SIZE);
    ctx.strokeRect(10 * CELL_SIZE, 10 * CELL_SIZE, 4 * CELL_SIZE, 4 * CELL_SIZE);

    // Draw colored home paths (on top of white cells in the cross)
    // RED home path (horizontal - row 7, columns 1-6)
    ctx.fillStyle = COLORS.red;
    for (let col = 1; col <= 6; col++) {
      ctx.fillRect(col * CELL_SIZE, 7 * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      ctx.strokeStyle = COLORS.black;
      ctx.lineWidth = 2;
      ctx.strokeRect(col * CELL_SIZE, 7 * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
    
    // GREEN home path (vertical - column 7, rows 1-6)
    ctx.fillStyle = COLORS.green;
    for (let row = 1; row <= 6; row++) {
      ctx.fillRect(7 * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      ctx.strokeStyle = COLORS.black;
      ctx.lineWidth = 2;
      ctx.strokeRect(7 * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
    
    // YELLOW home path (vertical - column 7, rows 8-13)
    ctx.fillStyle = COLORS.yellow;
    for (let row = 8; row <= 13; row++) {
      ctx.fillRect(7 * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      ctx.strokeStyle = COLORS.black;
      ctx.lineWidth = 2;
      ctx.strokeRect(7 * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
    
    // BLUE home path (horizontal - row 7, columns 8-13)
    ctx.fillStyle = COLORS.blue;
    for (let col = 8; col <= 13; col++) {
      ctx.fillRect(col * CELL_SIZE, 7 * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      ctx.strokeStyle = COLORS.black;
      ctx.lineWidth = 2;
      ctx.strokeRect(col * CELL_SIZE, 7 * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }

    // Center finish area with 4 colored triangles
    const centerX = 7.5 * CELL_SIZE;
    const centerY = 7.5 * CELL_SIZE;
    const triangleSize = 1.5 * CELL_SIZE;
    
    // RED triangle (left)
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
    
    // GREEN triangle (top)
    ctx.fillStyle = COLORS.green;
    ctx.beginPath();
    ctx.moveTo(centerX - triangleSize, centerY - triangleSize);
    ctx.lineTo(centerX, centerY);
    ctx.lineTo(centerX + triangleSize, centerY - triangleSize);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // YELLOW triangle (bottom)
    ctx.fillStyle = COLORS.yellow;
    ctx.beginPath();
    ctx.moveTo(centerX - triangleSize, centerY + triangleSize);
    ctx.lineTo(centerX, centerY);
    ctx.lineTo(centerX + triangleSize, centerY + triangleSize);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // BLUE triangle (right)
    ctx.fillStyle = COLORS.blue;
    ctx.beginPath();
    ctx.moveTo(centerX + triangleSize, centerY - triangleSize);
    ctx.lineTo(centerX, centerY);
    ctx.lineTo(centerX + triangleSize, centerY + triangleSize);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Center white circle
    ctx.fillStyle = COLORS.white;
    ctx.beginPath();
    ctx.arc(centerX, centerY, CELL_SIZE * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  // Draw tokens - simple circular style like reference image
  const drawTokens = (ctx) => {
    if (!gameState || !gameState.tokens) return;

    const mainPath = getMainPath();
    const homePaths = getHomePaths();

    Object.keys(gameState.tokens).forEach(playerId => {
      const playerTokens = gameState.tokens[playerId];
      const color = playerTokens.color;
      const config = PLAYER_CONFIG[color];

      playerTokens.tokens.forEach((token, idx) => {
        let x, y;

        if (token.position === 'home') {
          // Token in home area
          const homePos = getHomePositions(color)[idx];
          x = homePos.x * CELL_SIZE + CELL_SIZE / 2;
          y = homePos.y * CELL_SIZE + CELL_SIZE / 2;
        } else if (token.finished) {
          // Token finished - place in center
          const angle = (idx * Math.PI * 2) / 4 - Math.PI / 2;
          x = 7.5 * CELL_SIZE + Math.cos(angle) * 20;
          y = 7.5 * CELL_SIZE + Math.sin(angle) * 20;
        } else if (token.position >= config.homeStart) {
          // Token in home path
          const homePathIndex = token.position - config.homeStart;
          if (homePathIndex < HOME_PATH_LENGTH) {
            const pos = homePaths[color][homePathIndex];
            x = pos.x * CELL_SIZE + CELL_SIZE / 2;
            y = pos.y * CELL_SIZE + CELL_SIZE / 2;
          } else {
            const angle = (idx * Math.PI * 2) / 4 - Math.PI / 2;
            x = 7.5 * CELL_SIZE + Math.cos(angle) * 20;
            y = 7.5 * CELL_SIZE + Math.sin(angle) * 20;
          }
        } else if (token.position >= 0 && token.position < MAIN_PATH_LENGTH) {
          // Token on main path
          const pos = mainPath[token.position];
          x = pos.x * CELL_SIZE + CELL_SIZE / 2;
          y = pos.y * CELL_SIZE + CELL_SIZE / 2;
        } else {
          const angle = (idx * Math.PI * 2) / 4 - Math.PI / 2;
          x = 7.5 * CELL_SIZE + Math.cos(angle) * 20;
          y = 7.5 * CELL_SIZE + Math.sin(angle) * 20;
        }

        // Check for stacking
        let stackOffset = 0;
        if (token.position !== 'home' && !token.finished) {
          const tokensOnSameCell = playerTokens.tokens.filter(
            (t, i) => i < idx && t.position === token.position && !t.finished
          ).length;
          stackOffset = tokensOnSameCell * 6;
        }

        // Simple shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(x + stackOffset + 2, y + 2, TOKEN_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Token - solid color (matching reference image)
        ctx.fillStyle = COLORS['token' + color.charAt(0).toUpperCase() + color.slice(1)];
        ctx.beginPath();
        ctx.arc(x + stackOffset, y, TOKEN_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Black border
        ctx.strokeStyle = COLORS.black;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Highlight available moves
        if (availableMoves.includes(idx) && gameState.currentPlayer?.id === currentUserId) {
          ctx.strokeStyle = '#00FF00';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(x + stackOffset, y, TOKEN_RADIUS + 6, 0, Math.PI * 2);
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

    const mainPath = getMainPath();
    const homePaths = getHomePaths();
    const color = playerTokens.color;
    const config = PLAYER_CONFIG[color];

    playerTokens.tokens.forEach((token, idx) => {
      let tokenX, tokenY;

      if (token.position === 'home') {
        const homePos = getHomePositions(color)[idx];
        tokenX = homePos.x * CELL_SIZE + CELL_SIZE / 2;
        tokenY = homePos.y * CELL_SIZE + CELL_SIZE / 2;
      } else if (token.finished) {
        const angle = (idx * Math.PI * 2) / 4 - Math.PI / 2;
        tokenX = 7.5 * CELL_SIZE + Math.cos(angle) * 20;
        tokenY = 7.5 * CELL_SIZE + Math.sin(angle) * 20;
      } else if (token.position >= config.homeStart) {
        const homePathIndex = token.position - config.homeStart;
        if (homePathIndex < HOME_PATH_LENGTH) {
          const pos = homePaths[color][homePathIndex];
          tokenX = pos.x * CELL_SIZE + CELL_SIZE / 2;
          tokenY = pos.y * CELL_SIZE + CELL_SIZE / 2;
        } else {
          const angle = (idx * Math.PI * 2) / 4 - Math.PI / 2;
          tokenX = 7.5 * CELL_SIZE + Math.cos(angle) * 20;
          tokenY = 7.5 * CELL_SIZE + Math.sin(angle) * 20;
        }
      } else if (token.position >= 0 && token.position < MAIN_PATH_LENGTH) {
        const pos = mainPath[token.position];
        tokenX = pos.x * CELL_SIZE + CELL_SIZE / 2;
        tokenY = pos.y * CELL_SIZE + CELL_SIZE / 2;
      } else {
        const angle = (idx * Math.PI * 2) / 4 - Math.PI / 2;
        tokenX = 7.5 * CELL_SIZE + Math.cos(angle) * 20;
        tokenY = 7.5 * CELL_SIZE + Math.sin(angle) * 20;
      }

      // Check for stacking offset
      let stackOffset = 0;
      if (token.position !== 'home' && !token.finished) {
        const tokensOnSameCell = playerTokens.tokens.filter(
          (t, i) => i < idx && t.position === token.position && !t.finished
        ).length;
        stackOffset = tokensOnSameCell * 6;
      }

      const distance = Math.sqrt((x - (tokenX + stackOffset)) ** 2 + (y - tokenY) ** 2);
      if (distance < TOKEN_RADIUS + 15 && availableMoves.includes(idx)) {
        onTokenClick(idx);
      }
    });
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Version indicator */}
      <div className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg font-bold text-sm">
        Board Version: 5.0.5 - Dice at Center
      </div>
      
      <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden border-4 border-black">
        <canvas
          ref={canvasRef}
          width={BOARD_SIZE}
          height={BOARD_SIZE}
          onClick={handleCanvasClick}
          className="cursor-pointer"
          style={{ 
            maxWidth: '100%', 
            height: 'auto', 
            display: 'block',
            imageRendering: 'crisp-edges'
          }}
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
