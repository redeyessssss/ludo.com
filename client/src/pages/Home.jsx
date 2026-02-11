import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const { user } = useAuthStore();
  const canvasRef = useRef(null);
  const [diceValue, setDiceValue] = useState(6);
  const [showCelebration, setShowCelebration] = useState(false);

  // Board configuration - exact same as game board
  const BOARD_SIZE = 600;
  const CELL_SIZE = 40;
  const TOKEN_RADIUS = 14;
  
  const COLORS = {
    red: '#E53935',
    green: '#43A047',
    blue: '#1E88E5',
    yellow: '#FDD835',
    white: '#FFFFFF',
    black: '#000000',
  };

  // Animation state - Red token journey
  const [redTokenState, setRedTokenState] = useState({
    pathIndex: 0,
    progress: 0,
    isMoving: true,
    celebrating: false
  });

  // Home positions for tokens (in colored home areas)
  const getHomePositions = (color) => {
    const homes = {
      red: [
        { x: 2, y: 2 }, { x: 4, y: 2 }, { x: 2, y: 4 }, { x: 4, y: 4 }
      ],
      green: [
        { x: 10, y: 2 }, { x: 12, y: 2 }, { x: 10, y: 4 }, { x: 12, y: 4 }
      ],
      yellow: [
        { x: 2, y: 10 }, { x: 4, y: 10 }, { x: 2, y: 12 }, { x: 4, y: 12 }
      ],
      blue: [
        { x: 10, y: 10 }, { x: 12, y: 10 }, { x: 10, y: 12 }, { x: 12, y: 12 }
      ],
    };
    return homes[color] || [];
  };

  // Complete path for red token: 52 main path cells + 6 home path cells
  const getCompleteRedPath = () => {
    const path = [];
    
    // 52-cell main path (starting from red's starting position)
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
    path.push({ x: 8, y: 1 });  // 13
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
    path.push({ x: 13, y: 8 }); // 26
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
    path.push({ x: 6, y: 13 }); // 39
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
    path.push({ x: 0, y: 7 });  // 50 - RED ENTRY POINT
    
    // RED HOME PATH (6 cells leading to center)
    path.push({ x: 1, y: 7 });  // 51
    path.push({ x: 2, y: 7 });  // 52
    path.push({ x: 3, y: 7 });  // 53
    path.push({ x: 4, y: 7 });  // 54
    path.push({ x: 5, y: 7 });  // 55
    path.push({ x: 6, y: 7 });  // 56 - CENTER (HOME)
    
    return path;
  };

  const redPath = getCompleteRedPath();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    // Draw the exact game board
    const drawBoard = () => {
      // White background
      ctx.fillStyle = COLORS.white;
      ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);

      // Draw 4 corner home boxes
      // RED (top-left)
      ctx.fillStyle = COLORS.red;
      ctx.fillRect(0, 0, 6 * CELL_SIZE, 6 * CELL_SIZE);
      ctx.fillStyle = COLORS.white;
      ctx.fillRect(CELL_SIZE, CELL_SIZE, 4 * CELL_SIZE, 4 * CELL_SIZE);
      ctx.strokeStyle = COLORS.black;
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, 6 * CELL_SIZE, 6 * CELL_SIZE);
      ctx.strokeRect(CELL_SIZE, CELL_SIZE, 4 * CELL_SIZE, 4 * CELL_SIZE);
      
      // GREEN (top-right)
      ctx.fillStyle = COLORS.green;
      ctx.fillRect(9 * CELL_SIZE, 0, 6 * CELL_SIZE, 6 * CELL_SIZE);
      ctx.fillStyle = COLORS.white;
      ctx.fillRect(10 * CELL_SIZE, CELL_SIZE, 4 * CELL_SIZE, 4 * CELL_SIZE);
      ctx.strokeStyle = COLORS.black;
      ctx.lineWidth = 2;
      ctx.strokeRect(9 * CELL_SIZE, 0, 6 * CELL_SIZE, 6 * CELL_SIZE);
      ctx.strokeRect(10 * CELL_SIZE, CELL_SIZE, 4 * CELL_SIZE, 4 * CELL_SIZE);
      
      // YELLOW (bottom-left)
      ctx.fillStyle = COLORS.yellow;
      ctx.fillRect(0, 9 * CELL_SIZE, 6 * CELL_SIZE, 6 * CELL_SIZE);
      ctx.fillStyle = COLORS.white;
      ctx.fillRect(CELL_SIZE, 10 * CELL_SIZE, 4 * CELL_SIZE, 4 * CELL_SIZE);
      ctx.strokeStyle = COLORS.black;
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 9 * CELL_SIZE, 6 * CELL_SIZE, 6 * CELL_SIZE);
      ctx.strokeRect(CELL_SIZE, 10 * CELL_SIZE, 4 * CELL_SIZE, 4 * CELL_SIZE);
      
      // BLUE (bottom-right)
      ctx.fillStyle = COLORS.blue;
      ctx.fillRect(9 * CELL_SIZE, 9 * CELL_SIZE, 6 * CELL_SIZE, 6 * CELL_SIZE);
      ctx.fillStyle = COLORS.white;
      ctx.fillRect(10 * CELL_SIZE, 10 * CELL_SIZE, 4 * CELL_SIZE, 4 * CELL_SIZE);
      ctx.strokeStyle = COLORS.black;
      ctx.lineWidth = 2;
      ctx.strokeRect(9 * CELL_SIZE, 9 * CELL_SIZE, 6 * CELL_SIZE, 6 * CELL_SIZE);
      ctx.strokeRect(10 * CELL_SIZE, 10 * CELL_SIZE, 4 * CELL_SIZE, 4 * CELL_SIZE);

      // Draw path cells
      const pathCells = [
        ...Array.from({ length: 3 }, (_, i) => ({ x: 0, y: 6 + i })),
        ...Array.from({ length: 3 }, (_, i) => ({ x: 6 + i, y: 0 })),
        ...Array.from({ length: 3 }, (_, i) => ({ x: 14, y: 6 + i })),
        ...Array.from({ length: 3 }, (_, i) => ({ x: 6 + i, y: 14 })),
        ...Array.from({ length: 6 }, (_, i) => ({ x: 1 + i, y: 6 })),
        ...Array.from({ length: 5 }, (_, i) => ({ x: 6, y: 1 + i })),
        ...Array.from({ length: 6 }, (_, i) => ({ x: 8, y: 1 + i })),
        ...Array.from({ length: 5 }, (_, i) => ({ x: 9 + i, y: 6 })),
        ...Array.from({ length: 6 }, (_, i) => ({ x: 13 - i, y: 8 })),
        ...Array.from({ length: 5 }, (_, i) => ({ x: 8, y: 9 + i })),
        ...Array.from({ length: 6 }, (_, i) => ({ x: 6, y: 13 - i })),
        ...Array.from({ length: 5 }, (_, i) => ({ x: 5 - i, y: 8 })),
        { x: 7, y: 6 }, { x: 7, y: 7 }, { x: 7, y: 8 },
      ];
      
      pathCells.forEach(cell => {
        ctx.fillStyle = COLORS.white;
        ctx.fillRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = COLORS.black;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      });

      // Draw colored home paths
      ctx.fillStyle = COLORS.red;
      for (let col = 1; col <= 6; col++) {
        ctx.fillRect(col * CELL_SIZE, 7 * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = COLORS.black;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(col * CELL_SIZE, 7 * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
      
      ctx.fillStyle = COLORS.green;
      for (let row = 1; row <= 6; row++) {
        ctx.fillRect(7 * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = COLORS.black;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(7 * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
      
      ctx.fillStyle = COLORS.blue;
      for (let col = 8; col <= 13; col++) {
        ctx.fillRect(col * CELL_SIZE, 7 * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = COLORS.black;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(col * CELL_SIZE, 7 * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
      
      ctx.fillStyle = COLORS.yellow;
      for (let row = 8; row <= 13; row++) {
        ctx.fillRect(7 * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = COLORS.black;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(7 * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }

      // Center triangles
      const centerX = 7.5 * CELL_SIZE;
      const centerY = 7.5 * CELL_SIZE;
      const triangleSize = 1.5 * CELL_SIZE;
      
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
      
      ctx.fillStyle = COLORS.green;
      ctx.beginPath();
      ctx.moveTo(centerX - triangleSize, centerY - triangleSize);
      ctx.lineTo(centerX, centerY);
      ctx.lineTo(centerX + triangleSize, centerY - triangleSize);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = COLORS.yellow;
      ctx.beginPath();
      ctx.moveTo(centerX - triangleSize, centerY + triangleSize);
      ctx.lineTo(centerX, centerY);
      ctx.lineTo(centerX + triangleSize, centerY + triangleSize);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = COLORS.blue;
      ctx.beginPath();
      ctx.moveTo(centerX + triangleSize, centerY - triangleSize);
      ctx.lineTo(centerX, centerY);
      ctx.lineTo(centerX + triangleSize, centerY + triangleSize);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = COLORS.white;
      ctx.beginPath();
      ctx.arc(centerX, centerY, CELL_SIZE * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = COLORS.black;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw stars on safe spots
      const safeSpots = [
        { x: 2, y: 8 }, { x: 6, y: 2 }, { x: 12, y: 6 }, { x: 8, y: 12 },
        { x: 1, y: 6 }, { x: 8, y: 1 }, { x: 13, y: 8 }, { x: 6, y: 13 }
      ];
      
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      safeSpots.forEach(spot => {
        const x = spot.x * CELL_SIZE + CELL_SIZE / 2;
        const y = spot.y * CELL_SIZE + CELL_SIZE / 2;
        ctx.fillStyle = '#FFD700';
        ctx.fillText('⭐', x, y);
      });
    };

    // Draw modern 3D tokens with bounce effect
    const drawToken = (x, y, color, scale = 1, glow = false, bounceOffset = 0) => {
      const tokenX = x * CELL_SIZE + CELL_SIZE / 2;
      const tokenY = y * CELL_SIZE + CELL_SIZE / 2 - bounceOffset;
      const radius = TOKEN_RADIUS * scale;

      // Glow effect
      if (glow) {
        const glowGradient = ctx.createRadialGradient(tokenX, tokenY, radius * 0.5, tokenX, tokenY, radius + 8);
        glowGradient.addColorStop(0, `${COLORS[color]}80`);
        glowGradient.addColorStop(1, `${COLORS[color]}00`);
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(tokenX, tokenY + 2, radius + 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Main token with gradient
      const gradient = ctx.createRadialGradient(
        tokenX - radius * 0.3, tokenY - radius * 0.3, radius * 0.2,
        tokenX, tokenY, radius
      );
      
      const gradientColors = {
        red: ['#FF6B6B', '#EE5A6F', '#C92A2A'],
        green: ['#51CF66', '#37B24D', '#2B8A3E'],
        blue: ['#4DABF7', '#339AF0', '#1971C2'],
        yellow: ['#FFE066', '#FCC419', '#FAB005']
      };
      
      const colors = gradientColors[color];
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(0.5, colors[1]);
      gradient.addColorStop(1, colors[2]);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(tokenX, tokenY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Glossy highlight
      const highlightGradient = ctx.createRadialGradient(
        tokenX - radius * 0.4, tokenY - radius * 0.4, 0,
        tokenX - radius * 0.4, tokenY - radius * 0.4, radius * 0.6
      );
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
      highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = highlightGradient;
      ctx.beginPath();
      ctx.arc(tokenX - radius * 0.2, tokenY - radius * 0.2, radius * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Border
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(tokenX, tokenY, radius, 0, Math.PI * 2);
      ctx.stroke();
    };

    // Animation loop
    const animate = () => {
      drawBoard();
      
      // Draw all static tokens (3 in each home box)
      const colors = ['red', 'green', 'blue', 'yellow'];
      colors.forEach(color => {
        const homePositions = getHomePositions(color);
        // Draw first 3 tokens in home positions (4th one is moving for red)
        const tokensInHome = color === 'red' ? 3 : 4;
        for (let i = 0; i < tokensInHome; i++) {
          const pos = homePositions[i];
          drawToken(pos.x, pos.y, color, 1, false, 0);
        }
      });
      
      // Draw red token on its journey (the 4th token)
      if (redTokenState.isMoving && redTokenState.pathIndex < redPath.length) {
        const currentPos = redPath[redTokenState.pathIndex];
        const nextPos = redTokenState.pathIndex < redPath.length - 1 ? redPath[redTokenState.pathIndex + 1] : currentPos;
        
        // Interpolate position
        const interpX = currentPos.x + (nextPos.x - currentPos.x) * redTokenState.progress;
        const interpY = currentPos.y + (nextPos.y - currentPos.y) * redTokenState.progress;
        
        // Bounce effect
        const bounce = Math.sin(redTokenState.progress * Math.PI) * 15;
        
        // Draw with glow and bounce
        drawToken(interpX, interpY, 'red', 1 + bounce * 0.01, true, bounce);
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [redTokenState, redPath]);

  // Red token journey animation
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setRedTokenState(prev => {
        if (!prev.isMoving) return prev;
        
        let newProgress = prev.progress + 0.08; // Speed of movement
        let newPathIndex = prev.pathIndex;
        let celebrating = prev.celebrating;
        
        if (newProgress >= 1) {
          newProgress = 0;
          newPathIndex++;
          
          // Roll dice for visual effect
          setDiceValue(Math.floor(Math.random() * 6) + 1);
          
          // Check if reached home (end of path)
          if (newPathIndex >= redPath.length) {
            celebrating = true;
            setShowCelebration(true);
            
            // Reset after celebration
            setTimeout(() => {
              setRedTokenState({
                pathIndex: 0,
                progress: 0,
                isMoving: true,
                celebrating: false
              });
              setShowCelebration(false);
            }, 3000);
            
            return {
              pathIndex: redPath.length - 1,
              progress: 1,
              isMoving: false,
              celebrating: true
            };
          }
        }
        
        return {
          pathIndex: newPathIndex,
          progress: newProgress,
          isMoving: true,
          celebrating
        };
      });
    }, 50); // Update every 50ms for smooth animation

    return () => clearInterval(progressInterval);
  }, [redPath.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Side - Animated Ludo Board */}
          <div className="flex justify-center items-center">
            <div className="relative">
              {/* Exact Game Board */}
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-black">
                <canvas
                  ref={canvasRef}
                  width={BOARD_SIZE}
                  height={BOARD_SIZE}
                  className="block"
                  style={{ 
                    maxWidth: '100%', 
                    height: 'auto',
                    imageRendering: 'crisp-edges'
                  }}
                />
                
                {/* Animated Dice in Center */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div className={`w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-2xl flex items-center justify-center text-3xl font-bold text-white transition-all duration-300 ${
                    diceValue === 6 ? 'animate-bounce scale-110' : 'animate-pulse'
                  }`}>
                    {diceValue}
                  </div>
                </div>

                {/* Celebration Fireworks */}
                {showCelebration && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute animate-firework text-2xl"
                        style={{
                          left: `${20 + Math.random() * 60}%`,
                          top: `${20 + Math.random() * 60}%`,
                          animationDelay: `${Math.random() * 1}s`,
                        }}
                      >
                        {['🎆', '🎇', '✨', '💥', '⭐'][Math.floor(Math.random() * 5)]}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-8 -right-8 text-6xl animate-float">🎲</div>
              <div className="absolute -bottom-8 -left-8 text-6xl animate-float" style={{ animationDelay: '1s' }}>🏆</div>
              
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl -z-10 animate-pulse"></div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl font-bold leading-tight animate-fade-in-up">
                Play Ludo Online
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 animate-gradient">
                  on the #1 Site!
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Join millions of players in the world's most popular Ludo game
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              {user ? (
                <Link 
                  to="/dashboard" 
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xl font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-2xl text-center"
                >
                  Play Now
                </Link>
              ) : (
                <>
                  <Link 
                    to="/register" 
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xl font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-2xl text-center"
                  >
                    Get Started
                  </Link>
                  <Link 
                    to="/login" 
                    className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white text-xl font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-xl text-center"
                  >
                    Log In
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">10M+</div>
                <div className="text-sm text-gray-400">Players</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">50M+</div>
                <div className="text-sm text-gray-400">Games Played</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">24/7</div>
                <div className="text-sm text-gray-400">Online</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-900/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Play on Ludo.com?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-all duration-300 hover:scale-105">
              <div className="text-5xl mb-4">🌍</div>
              <h3 className="text-2xl font-bold mb-3">Global Multiplayer</h3>
              <p className="text-gray-400">
                Play with friends or match with players from around the world in real-time
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-all duration-300 hover:scale-105">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold mb-3">Ranked Matches</h3>
              <p className="text-gray-400">
                Climb the leaderboard and compete for the top spot with skill-based matchmaking
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-all duration-300 hover:scale-105">
              <div className="text-5xl mb-4">🎮</div>
              <h3 className="text-2xl font-bold mb-3">Multiple Modes</h3>
              <p className="text-gray-400">
                Quick play, ranked matches, tournaments, and private rooms with friends
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Game Modes Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-5xl font-bold">
                Improve Your Game
              </h2>
              <p className="text-xl text-gray-300">
                Master Ludo with practice modes, tutorials, and compete in daily tournaments
              </p>
              <ul className="space-y-4">
                {[
                  'Real-time multiplayer matches',
                  'Private rooms with friends',
                  'Daily missions and rewards',
                  'Global leaderboards',
                  'Chat with players',
                  'Mobile-friendly design'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center space-x-3">
                    <span className="text-green-400 text-2xl">✓</span>
                    <span className="text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Mode Cards */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer">
                <div className="text-4xl mb-3">⚡</div>
                <h3 className="text-xl font-bold mb-2">Quick Play</h3>
                <p className="text-sm text-blue-100">Jump into a game instantly</p>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer">
                <div className="text-4xl mb-3">🏆</div>
                <h3 className="text-xl font-bold mb-2">Ranked</h3>
                <p className="text-sm text-purple-100">Compete for rating</p>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer">
                <div className="text-4xl mb-3">🔒</div>
                <h3 className="text-xl font-bold mb-2">Private</h3>
                <p className="text-sm text-green-100">Play with friends</p>
              </div>

              <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="text-xl font-bold mb-2">Tournament</h3>
                <p className="text-sm text-orange-100">Win big prizes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to Play?</h2>
          <p className="text-2xl mb-8 text-green-50">Join millions of players today!</p>
          {!user && (
            <Link 
              to="/register" 
              className="inline-block px-12 py-5 bg-white text-green-600 text-2xl font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-2xl"
            >
              Sign Up - It's Free!
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
