import { useEffect, useRef } from 'react';

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
  
  // Enhanced color palette (Ludo King style - vibrant and modern)
  const COLORS = {
    red: '#FF3B30',
    redDark: '#C7281E',
    redLight: '#FF6B60',
    blue: '#007AFF',
    blueDark: '#0051D5',
    blueLight: '#4DA3FF',
    green: '#34C759',
    greenDark: '#248A3D',
    greenLight: '#5DD67D',
    yellow: '#FFCC00',
    yellowDark: '#D4A800',
    yellowLight: '#FFD633',
    white: '#FFFFFF',
    black: '#000000',
    boardBg: '#F8F4E6',
    pathBg: '#FEFDFB',
    safeGold: '#FFD700',
    safeGlow: '#FFF4CC',
  };

  // Get the 52-cell main path (clockwise from red start)
  const getMainPath = () => {
    const path = [];
    
    // RED START (position 0) - row 6, col 1
    path.push({ x: 1, y: 6 });
    
    // Left column going UP (positions 1-5)
    for (let i = 5; i >= 1; i--) {
      path.push({ x: 0, y: i });
    }
    
    // Top row going RIGHT (positions 6-12)
    for (let i = 0; i <= 6; i++) {
      path.push({ x: i, y: 0 });
    }
    
    // GREEN START (position 13) - row 0, col 7
    
    // Top row continuing RIGHT (positions 14-18)
    for (let i = 7; i <= 11; i++) {
      path.push({ x: i, y: 0 });
    }
    
    // Top-right corner going DOWN (positions 19-20)
    path.push({ x: 12, y: 0 });
    
    // Right column going DOWN (positions 21-25)
    for (let i = 1; i <= 5; i++) {
      path.push({ x: 12, y: i });
    }
    
    // BLUE START (position 26) - row 6, col 12
    path.push({ x: 12, y: 6 });
    
    // Right column continuing DOWN (positions 27-31)
    for (let i = 7; i <= 11; i++) {
      path.push({ x: 12, y: i });
    }
    
    // Bottom-right corner going LEFT (positions 32)
    path.push({ x: 12, y: 12 });
    
    // Bottom row going LEFT (positions 33-38)
    for (let i = 11; i >= 7; i--) {
      path.push({ x: i, y: 12 });
    }
    
    // YELLOW START (position 39) - row 12, col 6
    
    // Bottom row continuing LEFT (positions 40-45)
    for (let i = 6; i >= 1; i--) {
      path.push({ x: i, y: 12 });
    }
    
    // Bottom-left corner going UP (positions 46)
    path.push({ x: 0, y: 12 });
    
    // Left column going UP back to start (positions 47-51)
    for (let i = 11; i >= 7; i--) {
      path.push({ x: 0, y: i });
    }
    
    return path;
  };

  // Home paths (colored paths leading to center)
  const getHomePaths = () => {
    return {
      red: [
        { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }
      ],
      green: [
        { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 6, y: 4 }, { x: 6, y: 5 }, { x: 6, y: 6 }
      ],
      yellow: [
        { x: 6, y: 11 }, { x: 6, y: 10 }, { x: 6, y: 9 }, { x: 6, y: 8 }, { x: 6, y: 7 }, { x: 6, y: 6 }
      ],
      blue: [
        { x: 11, y: 6 }, { x: 10, y: 6 }, { x: 9, y: 6 }, { x: 8, y: 6 }, { x: 7, y: 6 }, { x: 6, y: 6 }
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
      yellow: [
        { x: 1.5, y: 8 }, { x: 4, y: 8 }, { x: 1.5, y: 10.5 }, { x: 4, y: 10.5 }
      ],
      blue: [
        { x: 8, y: 8 }, { x: 10.5, y: 8 }, { x: 8, y: 10.5 }, { x: 10.5, y: 10.5 }
      ],
    };
    return homes[color] || [];
  };

  // Helper: Draw gradient rectangle
  const drawGradientRect = (ctx, x, y, width, height, color1, color2) => {
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
  };

  // Draw the 15x15 grid board with Ludo King style visuals
  const drawBoard = (ctx) => {
    // Background with warm texture
    ctx.fillStyle = COLORS.boardBg;
    ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);

    // Draw 13x13 visible grid with subtle gradients
    for (let row = 0; row < 13; row++) {
      for (let col = 0; col < 13; col++) {
        const x = col * CELL_SIZE + (col >= 6 ? 180 : 0);
        const y = row * CELL_SIZE + (row >= 6 ? 180 : 0);
        
        // Path cells with subtle gradient
        const gradient = ctx.createLinearGradient(x, y, x + CELL_SIZE, y + CELL_SIZE);
        gradient.addColorStop(0, COLORS.pathBg);
        gradient.addColorStop(1, '#F5F2E8');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        
        // Border
        ctx.strokeStyle = '#D4CDB8';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
      }
    }

    // Draw home areas with vibrant gradients (Ludo King style)
    // Red (top-left)
    drawGradientRect(ctx, 0, 0, 360, 360, COLORS.red, COLORS.redDark);
    drawGradientRect(ctx, 40, 40, 280, 280, COLORS.white, '#FFF8F8');
    ctx.strokeStyle = COLORS.redDark;
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, 360, 360);
    ctx.strokeStyle = COLORS.red;
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, 280, 280);
    
    // Green (top-right)
    drawGradientRect(ctx, 540, 0, 360, 360, COLORS.green, COLORS.greenDark);
    drawGradientRect(ctx, 580, 40, 280, 280, COLORS.white, '#F8FFF8');
    ctx.strokeStyle = COLORS.greenDark;
    ctx.lineWidth = 5;
    ctx.strokeRect(540, 0, 360, 360);
    ctx.strokeStyle = COLORS.green;
    ctx.lineWidth = 3;
    ctx.strokeRect(580, 40, 280, 280);
    
    // Yellow (bottom-left)
    drawGradientRect(ctx, 0, 540, 360, 360, COLORS.yellow, COLORS.yellowDark);
    drawGradientRect(ctx, 40, 580, 280, 280, COLORS.white, '#FFFEF8');
    ctx.strokeStyle = COLORS.yellowDark;
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 540, 360, 360);
    ctx.strokeStyle = COLORS.yellow;
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 580, 280, 280);
    
    // Blue (bottom-right)
    drawGradientRect(ctx, 540, 540, 360, 360, COLORS.blue, COLORS.blueDark);
    drawGradientRect(ctx, 580, 580, 280, 280, COLORS.white, '#F8F8FF');
    ctx.strokeStyle = COLORS.blueDark;
    ctx.lineWidth = 5;
    ctx.strokeRect(540, 540, 360, 360);
    ctx.strokeStyle = COLORS.blue;
    ctx.lineWidth = 3;
    ctx.strokeRect(580, 580, 280, 280);

    // Draw home paths with gradients
    const homePaths = getHomePaths();
    Object.keys(homePaths).forEach(color => {
      const darkColor = COLORS[color + 'Dark'];
      
      homePaths[color].forEach((pos, idx) => {
        const x = pos.x * CELL_SIZE + (pos.x >= 6 ? 180 : 0);
        const y = pos.y * CELL_SIZE + (pos.y >= 6 ? 180 : 0);
        
        // Gradient for home path
        drawGradientRect(ctx, x, y, CELL_SIZE, CELL_SIZE, COLORS[color], darkColor);
        
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
        
        // Arrow indicator on first cell
        if (idx === 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('▶', x + CELL_SIZE / 2, y + CELL_SIZE / 2);
        }
      });
    });

    // Draw main path with enhanced safe spots
    const mainPath = getMainPath();
    mainPath.forEach((pos, idx) => {
      const x = pos.x * CELL_SIZE + (pos.x >= 6 ? 180 : 0);
      const y = pos.y * CELL_SIZE + (pos.y >= 6 ? 180 : 0);
      
      // Border
      ctx.strokeStyle = '#C4BDA8';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

      // Safe cells with glow effect (Ludo King style)
      if (SAFE_CELLS.includes(idx)) {
        // Glow effect
        const glowGradient = ctx.createRadialGradient(
          x + CELL_SIZE / 2, y + CELL_SIZE / 2, 0,
          x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE / 2
        );
        glowGradient.addColorStop(0, COLORS.safeGlow);
        glowGradient.addColorStop(1, 'rgba(255, 244, 204, 0)');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        
        // Star with shadow
        ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillStyle = COLORS.safeGold;
        ctx.font = 'bold 38px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', x + CELL_SIZE / 2, y + CELL_SIZE / 2);
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }
    });

    // Center finish area with enhanced triangles and glow
    const centerX = BOARD_SIZE / 2;
    const centerY = BOARD_SIZE / 2;
    const triangleSize = 90;
    
    // Red triangle (left) with gradient
    const redGradient = ctx.createLinearGradient(centerX - triangleSize, centerY, centerX, centerY);
    redGradient.addColorStop(0, COLORS.red);
    redGradient.addColorStop(1, COLORS.redDark);
    ctx.fillStyle = redGradient;
    ctx.beginPath();
    ctx.moveTo(centerX - triangleSize, centerY - triangleSize);
    ctx.lineTo(centerX, centerY);
    ctx.lineTo(centerX - triangleSize, centerY + triangleSize);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = COLORS.redDark;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Green triangle (top) with gradient
    const greenGradient = ctx.createLinearGradient(centerX, centerY - triangleSize, centerX, centerY);
    greenGradient.addColorStop(0, COLORS.green);
    greenGradient.addColorStop(1, COLORS.greenDark);
    ctx.fillStyle = greenGradient;
    ctx.beginPath();
    ctx.moveTo(centerX - triangleSize, centerY - triangleSize);
    ctx.lineTo(centerX, centerY);
    ctx.lineTo(centerX + triangleSize, centerY - triangleSize);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = COLORS.greenDark;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Yellow triangle (bottom) with gradient
    const yellowGradient = ctx.createLinearGradient(centerX, centerY, centerX, centerY + triangleSize);
    yellowGradient.addColorStop(0, COLORS.yellow);
    yellowGradient.addColorStop(1, COLORS.yellowDark);
    ctx.fillStyle = yellowGradient;
    ctx.beginPath();
    ctx.moveTo(centerX - triangleSize, centerY + triangleSize);
    ctx.lineTo(centerX, centerY);
    ctx.lineTo(centerX + triangleSize, centerY + triangleSize);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = COLORS.yellowDark;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Blue triangle (right) with gradient
    const blueGradient = ctx.createLinearGradient(centerX, centerY, centerX + triangleSize, centerY);
    blueGradient.addColorStop(0, COLORS.blue);
    blueGradient.addColorStop(1, COLORS.blueDark);
    ctx.fillStyle = blueGradient;
    ctx.beginPath();
    ctx.moveTo(centerX + triangleSize, centerY - triangleSize);
    ctx.lineTo(centerX, centerY);
    ctx.lineTo(centerX + triangleSize, centerY + triangleSize);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = COLORS.blueDark;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Center circle with radial gradient and glow
    ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
    ctx.shadowBlur = 20;
    
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 50);
    centerGradient.addColorStop(0, '#FFFFFF');
    centerGradient.addColorStop(0.7, '#FFF9E6');
    centerGradient.addColorStop(1, COLORS.safeGold);
    ctx.fillStyle = centerGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    ctx.strokeStyle = COLORS.yellowDark;
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // HOME emoji with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = COLORS.black;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏠', centerX, centerY);
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  };

  // Draw tokens with 3D glossy effect (Ludo King style)
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
          x = homePos.x * CELL_SIZE + (homePos.x >= 6 ? 180 : 0);
          y = homePos.y * CELL_SIZE + (homePos.y >= 6 ? 180 : 0);
        } else if (token.finished) {
          // Token finished - place in center
          const angle = (idx * Math.PI * 2) / 4 - Math.PI / 2;
          x = BOARD_SIZE / 2 + Math.cos(angle) * 25;
          y = BOARD_SIZE / 2 + Math.sin(angle) * 25;
        } else if (token.position >= config.homeStart) {
          // Token in home path (colored path to center)
          const homePathIndex = token.position - config.homeStart;
          if (homePathIndex < HOME_PATH_LENGTH) {
            const pos = homePaths[color][homePathIndex];
            x = pos.x * CELL_SIZE + (pos.x >= 6 ? 180 : 0) + CELL_SIZE / 2;
            y = pos.y * CELL_SIZE + (pos.y >= 6 ? 180 : 0) + CELL_SIZE / 2;
          } else {
            // Finished
            const angle = (idx * Math.PI * 2) / 4 - Math.PI / 2;
            x = BOARD_SIZE / 2 + Math.cos(angle) * 25;
            y = BOARD_SIZE / 2 + Math.sin(angle) * 25;
          }
        } else if (token.position >= 0 && token.position < MAIN_PATH_LENGTH) {
          // Token on main path
          const pos = mainPath[token.position];
          x = pos.x * CELL_SIZE + (pos.x >= 6 ? 180 : 0) + CELL_SIZE / 2;
          y = pos.y * CELL_SIZE + (pos.y >= 6 ? 180 : 0) + CELL_SIZE / 2;
        } else {
          // Fallback
          const angle = (idx * Math.PI * 2) / 4 - Math.PI / 2;
          x = BOARD_SIZE / 2 + Math.cos(angle) * 25;
          y = BOARD_SIZE / 2 + Math.sin(angle) * 25;
        }

        // Check for stacking (multiple tokens on same position)
        let stackOffset = 0;
        if (token.position !== 'home' && !token.finished) {
          const tokensOnSameCell = playerTokens.tokens.filter(
            (t, i) => i < idx && t.position === token.position && !t.finished
          ).length;
          stackOffset = tokensOnSameCell * 8;
        }

        // Shadow (soft and realistic)
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(x + stackOffset + 2, y + 2, TOKEN_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Token base with gradient (3D effect)
        const tokenGradient = ctx.createRadialGradient(
          x + stackOffset - TOKEN_RADIUS / 3, 
          y - TOKEN_RADIUS / 3, 
          0,
          x + stackOffset, 
          y, 
          TOKEN_RADIUS
        );
        tokenGradient.addColorStop(0, COLORS[color + 'Light'] || COLORS[color]);
        tokenGradient.addColorStop(0.6, COLORS[color]);
        tokenGradient.addColorStop(1, COLORS[color + 'Dark'] || COLORS[color]);
        
        ctx.fillStyle = tokenGradient;
        ctx.beginPath();
        ctx.arc(x + stackOffset, y, TOKEN_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Glossy highlight (top-left)
        const highlightGradient = ctx.createRadialGradient(
          x + stackOffset - TOKEN_RADIUS / 4,
          y - TOKEN_RADIUS / 4,
          0,
          x + stackOffset - TOKEN_RADIUS / 4,
          y - TOKEN_RADIUS / 4,
          TOKEN_RADIUS / 2
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = highlightGradient;
        ctx.beginPath();
        ctx.arc(x + stackOffset, y, TOKEN_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Border (darker for depth)
        ctx.strokeStyle = COLORS[color + 'Dark'] || COLORS.black;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x + stackOffset, y, TOKEN_RADIUS, 0, Math.PI * 2);
        ctx.stroke();

        // Number with shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        ctx.fillStyle = COLORS.white;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(idx + 1, x + stackOffset, y);
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Highlight available moves with animated glow
        if (availableMoves.includes(idx) && gameState.currentPlayer?.id === currentUserId) {
          // Outer glow
          ctx.strokeStyle = '#00FF00';
          ctx.lineWidth = 5;
          ctx.shadowColor = 'rgba(0, 255, 0, 0.8)';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(x + stackOffset, y, TOKEN_RADIUS + 8, 0, Math.PI * 2);
          ctx.stroke();
          
          // Inner glow (pulsing effect)
          ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
          ctx.lineWidth = 3;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(x + stackOffset, y, TOKEN_RADIUS + 12, 0, Math.PI * 2);
          ctx.stroke();
          
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
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
        tokenX = homePos.x * CELL_SIZE + (homePos.x >= 6 ? 180 : 0);
        tokenY = homePos.y * CELL_SIZE + (homePos.y >= 6 ? 180 : 0);
      } else if (token.finished) {
        const angle = (idx * Math.PI * 2) / 4 - Math.PI / 2;
        tokenX = BOARD_SIZE / 2 + Math.cos(angle) * 25;
        tokenY = BOARD_SIZE / 2 + Math.sin(angle) * 25;
      } else if (token.position >= config.homeStart) {
        const homePathIndex = token.position - config.homeStart;
        if (homePathIndex < HOME_PATH_LENGTH) {
          const pos = homePaths[color][homePathIndex];
          tokenX = pos.x * CELL_SIZE + (pos.x >= 6 ? 180 : 0) + CELL_SIZE / 2;
          tokenY = pos.y * CELL_SIZE + (pos.y >= 6 ? 180 : 0) + CELL_SIZE / 2;
        } else {
          const angle = (idx * Math.PI * 2) / 4 - Math.PI / 2;
          tokenX = BOARD_SIZE / 2 + Math.cos(angle) * 25;
          tokenY = BOARD_SIZE / 2 + Math.sin(angle) * 25;
        }
      } else if (token.position >= 0 && token.position < MAIN_PATH_LENGTH) {
        const pos = mainPath[token.position];
        tokenX = pos.x * CELL_SIZE + (pos.x >= 6 ? 180 : 0) + CELL_SIZE / 2;
        tokenY = pos.y * CELL_SIZE + (pos.y >= 6 ? 180 : 0) + CELL_SIZE / 2;
      } else {
        const angle = (idx * Math.PI * 2) / 4 - Math.PI / 2;
        tokenX = BOARD_SIZE / 2 + Math.cos(angle) * 25;
        tokenY = BOARD_SIZE / 2 + Math.sin(angle) * 25;
      }

      // Check for stacking offset
      let stackOffset = 0;
      if (token.position !== 'home' && !token.finished) {
        const tokensOnSameCell = playerTokens.tokens.filter(
          (t, i) => i < idx && t.position === token.position && !t.finished
        ).length;
        stackOffset = tokensOnSameCell * 8;
      }

      const distance = Math.sqrt((x - (tokenX + stackOffset)) ** 2 + (y - tokenY) ** 2);
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
