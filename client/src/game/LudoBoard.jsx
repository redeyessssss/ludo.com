import { useEffect, useRef } from 'react';

// VERSION 5.5.0 - Added star markers (⭐) for safe spots
// CONSTANTS & CONFIG
const MAIN_PATH_LENGTH = 52;
const SAFE_CELLS = [0, 8, 13, 21, 26, 34, 39, 47]; // Safe spots: starting positions + star positions
// Position mapping: 
// 0 = (1,6) Red start
// 8 = (6,2) Top safe spot ⭐
// 13 = (8,1) Green start  
// 21 = (12,6) Right safe spot ⭐
// 26 = (13,8) Blue start
// 34 = (8,12) Bottom safe spot ⭐
// 39 = (6,13) Yellow start
// 47 = (2,8) Left safe spot ⭐
const PLAYER_CONFIG = {
  red:    { start: 0,  entry: 50, homeStart: 100 },  // Red enters home from position 50 (0,7)
  green:  { start: 13, entry: 11, homeStart: 200 },  // Green enters home from position 11 (7,0)
  blue:   { start: 26, entry: 24, homeStart: 400 },  // Blue enters home from position 24 (14,7)
  yellow: { start: 39, entry: 37, homeStart: 300 }   // Yellow enters home from position 37 (7,14)
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

  // Get the 52-cell main path following traditional Ludo clockwise pattern
  // All colors follow the same pattern, just starting from different positions
  const getMainPath = () => {
    const path = [];
    
    // Position 0-5: RED starts, goes RIGHT along row 6
    path.push({ x: 1, y: 6 });  // 0 - RED START
    path.push({ x: 2, y: 6 });  // 1
    path.push({ x: 3, y: 6 });  // 2
    path.push({ x: 4, y: 6 });  // 3
    path.push({ x: 5, y: 6 });  // 4
    
    // Position 5-11: Turn UP at column 6
    path.push({ x: 6, y: 5 });  // 5
    path.push({ x: 6, y: 4 });  // 6
    path.push({ x: 6, y: 3 });  // 7
    path.push({ x: 6, y: 2 });  // 8
    path.push({ x: 6, y: 1 });  // 9
    path.push({ x: 6, y: 0 });  // 10
    
    // Position 11-12: Go RIGHT along row 0
    path.push({ x: 7, y: 0 });  // 11
    path.push({ x: 8, y: 0 });  // 12
    
    // Position 13-18: GREEN starts, goes DOWN along column 8
    path.push({ x: 8, y: 1 });  // 13 - GREEN START
    path.push({ x: 8, y: 2 });  // 14
    path.push({ x: 8, y: 3 });  // 15
    path.push({ x: 8, y: 4 });  // 16
    path.push({ x: 8, y: 5 });  // 17
    
    // Position 18-24: Turn RIGHT at row 6
    path.push({ x: 9, y: 6 });  // 18
    path.push({ x: 10, y: 6 }); // 19
    path.push({ x: 11, y: 6 }); // 20
    path.push({ x: 12, y: 6 }); // 21
    path.push({ x: 13, y: 6 }); // 22
    path.push({ x: 14, y: 6 }); // 23
    
    // Position 24-26: Go DOWN along column 14
    path.push({ x: 14, y: 7 }); // 24
    path.push({ x: 14, y: 8 }); // 25
    
    // Position 26-31: BLUE starts, goes LEFT along row 8
    path.push({ x: 13, y: 8 }); // 26 - BLUE START
    path.push({ x: 12, y: 8 }); // 27
    path.push({ x: 11, y: 8 }); // 28
    path.push({ x: 10, y: 8 }); // 29
    path.push({ x: 9, y: 8 });  // 30
    
    // Position 31-37: Turn DOWN at column 8
    path.push({ x: 8, y: 9 });  // 31
    path.push({ x: 8, y: 10 }); // 32
    path.push({ x: 8, y: 11 }); // 33
    path.push({ x: 8, y: 12 }); // 34
    path.push({ x: 8, y: 13 }); // 35
    path.push({ x: 8, y: 14 }); // 36
    
    // Position 37-39: Go LEFT along row 14
    path.push({ x: 7, y: 14 }); // 37
    path.push({ x: 6, y: 14 }); // 38
    
    // Position 39-44: YELLOW starts, goes UP along column 6
    path.push({ x: 6, y: 13 }); // 39 - YELLOW START
    path.push({ x: 6, y: 12 }); // 40
    path.push({ x: 6, y: 11 }); // 41
    path.push({ x: 6, y: 10 }); // 42
    path.push({ x: 6, y: 9 });  // 43
    
    // Position 44-50: Turn LEFT at row 8
    path.push({ x: 5, y: 8 });  // 44
    path.push({ x: 4, y: 8 });  // 45
    path.push({ x: 3, y: 8 });  // 46
    path.push({ x: 2, y: 8 });  // 47
    path.push({ x: 1, y: 8 });  // 48
    path.push({ x: 0, y: 8 });  // 49
    
    // Position 50-51: Go UP along column 0 (back to RED entry)
    path.push({ x: 0, y: 7 });  // 50
    path.push({ x: 0, y: 6 });  // 51 - Wraps back to position 0
    
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
      blue: [
        { x: 13, y: 7 }, { x: 12, y: 7 }, { x: 11, y: 7 }, { x: 10, y: 7 }, { x: 9, y: 7 }, { x: 8, y: 7 }
      ],
      yellow: [
        { x: 7, y: 13 }, { x: 7, y: 12 }, { x: 7, y: 11 }, { x: 7, y: 10 }, { x: 7, y: 9 }, { x: 7, y: 8 }
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

    // Draw the 4 corner home boxes first
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

    // Draw only the playable path cells (not corner diagonals)
    // Define which cells are part of the actual Ludo path
    const pathCells = [
      // Left side vertical path (col 0, rows 6-8)
      { x: 0, y: 6 }, { x: 0, y: 7 }, { x: 0, y: 8 },
      
      // Top side horizontal path (row 0, cols 6-8)
      { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 },
      
      // Right side vertical path (col 14, rows 6-8)
      { x: 14, y: 6 }, { x: 14, y: 7 }, { x: 14, y: 8 },
      
      // Bottom side horizontal path (row 14, cols 6-8)
      { x: 6, y: 14 }, { x: 7, y: 14 }, { x: 8, y: 14 },
      
      // Red's path cells (left side + top left + top)
      { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 },
      { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 6, y: 4 }, { x: 6, y: 5 },
      
      // Green's path cells (top + top right + right)
      { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 5 }, { x: 8, y: 6 },
      { x: 9, y: 6 }, { x: 10, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 },
      
      // Blue's path cells (right + bottom right + bottom)
      { x: 13, y: 8 }, { x: 12, y: 8 }, { x: 11, y: 8 }, { x: 10, y: 8 }, { x: 9, y: 8 }, { x: 8, y: 8 },
      { x: 8, y: 9 }, { x: 8, y: 10 }, { x: 8, y: 11 }, { x: 8, y: 12 }, { x: 8, y: 13 },
      
      // Yellow's path cells (bottom + bottom left + left)
      { x: 6, y: 13 }, { x: 6, y: 12 }, { x: 6, y: 11 }, { x: 6, y: 10 }, { x: 6, y: 9 }, { x: 6, y: 8 },
      { x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 8 },
      
      // Center cells
      { x: 7, y: 6 }, { x: 7, y: 7 }, { x: 7, y: 8 },
    ];
    
    // Draw white path cells with black borders
    pathCells.forEach(cell => {
      ctx.fillStyle = COLORS.white;
      ctx.fillRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      ctx.strokeStyle = COLORS.black;
      ctx.lineWidth = 2;
      ctx.strokeRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });

    // Draw colored home paths
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
    
    // BLUE home path (horizontal - row 7, columns 8-13)
    ctx.fillStyle = COLORS.blue;
    for (let col = 8; col <= 13; col++) {
      ctx.fillRect(col * CELL_SIZE, 7 * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      ctx.strokeStyle = COLORS.black;
      ctx.lineWidth = 2;
      ctx.strokeRect(col * CELL_SIZE, 7 * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
    
    // YELLOW home path (vertical - column 7, rows 8-13)
    ctx.fillStyle = COLORS.yellow;
    for (let row = 8; row <= 13; row++) {
      ctx.fillRect(7 * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      ctx.strokeStyle = COLORS.black;
      ctx.lineWidth = 2;
      ctx.strokeRect(7 * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
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

    // Draw cell IDs only on playable cells
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Safe spots coordinates
    const safeSpots = [
      { x: 2, y: 8 },   // Left safe spot
      { x: 6, y: 2 },   // Top safe spot
      { x: 12, y: 6 },  // Right safe spot
      { x: 8, y: 12 }   // Bottom safe spot
    ];
    
    pathCells.forEach(cell => {
      const x = cell.x * CELL_SIZE + CELL_SIZE / 2;
      const y = cell.y * CELL_SIZE + CELL_SIZE / 2;
      
      // Check if this is a safe spot
      const isSafeSpot = safeSpots.some(spot => spot.x === cell.x && spot.y === cell.y);
      
      if (isSafeSpot) {
        // Draw star for safe spots
        ctx.font = '32px Arial';
        ctx.fillStyle = '#FFD700'; // Gold color
        ctx.fillText('⭐', x, y);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeText('⭐', x, y);
      } else {
        // Draw cell coordinates
        ctx.font = '10px Arial';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillText(`${cell.x},${cell.y}`, x, y);
      }
    });
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
        Board Version: 5.5.0 - Safe Spots ⭐
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
