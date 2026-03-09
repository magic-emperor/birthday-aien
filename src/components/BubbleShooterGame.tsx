import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

const COLS = 10;
const ROWS = 10;
const BUBBLE_RADIUS = 18;
const BUBBLE_DIAMETER = BUBBLE_RADIUS * 2;
const CANVAS_WIDTH = COLS * BUBBLE_DIAMETER + BUBBLE_RADIUS;
const CANVAS_HEIGHT = 500;
const COLORS = [
  'hsl(330, 70%, 60%)',  // pink
  'hsl(280, 60%, 55%)',  // purple
  'hsl(200, 70%, 55%)',  // blue
  'hsl(45, 80%, 55%)',   // gold
  'hsl(150, 60%, 50%)',  // green
  'hsl(15, 80%, 58%)',   // orange
];

interface Bubble {
  row: number;
  col: number;
  color: string;
}

interface ShootingBubble {
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
}

const getX = (row: number, col: number) => {
  const offset = row % 2 === 1 ? BUBBLE_RADIUS : 0;
  return col * BUBBLE_DIAMETER + BUBBLE_RADIUS + offset;
};

const getY = (row: number) => {
  return row * (BUBBLE_DIAMETER - 4) + BUBBLE_RADIUS;
};

const BubbleShooterGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [grid, setGrid] = useState<(string | null)[][]>([]);
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [nextColor, setNextColor] = useState(COLORS[1]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [aimAngle, setAimAngle] = useState(-Math.PI / 2);
  const shootingRef = useRef<ShootingBubble | null>(null);
  const animRef = useRef<number>(0);
  const gridRef = useRef<(string | null)[][]>([]);
  const isShooting = useRef(false);

  const initGrid = useCallback(() => {
    const newGrid: (string | null)[][] = [];
    for (let r = 0; r < ROWS; r++) {
      const row: (string | null)[] = [];
      const maxCols = r % 2 === 1 ? COLS - 1 : COLS;
      for (let c = 0; c < maxCols; c++) {
        row.push(r < 5 ? COLORS[Math.floor(Math.random() * COLORS.length)] : null);
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
    gridRef.current = newGrid;
  }, []);

  useEffect(() => {
    initGrid();
    setCurrentColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    setNextColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
  }, [initGrid]);

  const findCluster = (g: (string | null)[][], row: number, col: number, color: string): [number, number][] => {
    const visited = new Set<string>();
    const cluster: [number, number][] = [];
    const stack: [number, number][] = [[row, col]];
    
    while (stack.length > 0) {
      const [r, c] = stack.pop()!;
      const key = `${r},${c}`;
      if (visited.has(key)) continue;
      if (r < 0 || r >= ROWS) continue;
      const maxC = r % 2 === 1 ? COLS - 1 : COLS;
      if (c < 0 || c >= maxC) continue;
      if (g[r][c] !== color) continue;
      
      visited.add(key);
      cluster.push([r, c]);
      
      // neighbors
      const even = r % 2 === 0;
      const neighbors: [number, number][] = [
        [r, c - 1], [r, c + 1],
        [r - 1, even ? c - 1 : c], [r - 1, even ? c : c + 1],
        [r + 1, even ? c - 1 : c], [r + 1, even ? c : c + 1],
      ];
      for (const n of neighbors) stack.push(n);
    }
    return cluster;
  };

  const removeFloating = (g: (string | null)[][]) => {
    const connected = new Set<string>();
    // BFS from top row
    const queue: [number, number][] = [];
    for (let c = 0; c < g[0].length; c++) {
      if (g[0][c]) {
        queue.push([0, c]);
        connected.add(`0,${c}`);
      }
    }
    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      const even = r % 2 === 0;
      const neighbors: [number, number][] = [
        [r, c - 1], [r, c + 1],
        [r - 1, even ? c - 1 : c], [r - 1, even ? c : c + 1],
        [r + 1, even ? c - 1 : c], [r + 1, even ? c : c + 1],
      ];
      for (const [nr, nc] of neighbors) {
        const key = `${nr},${nc}`;
        if (nr < 0 || nr >= ROWS) continue;
        const maxC = nr % 2 === 1 ? COLS - 1 : COLS;
        if (nc < 0 || nc >= maxC) continue;
        if (connected.has(key) || !g[nr][nc]) continue;
        connected.add(key);
        queue.push([nr, nc]);
      }
    }
    let removed = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < g[r].length; c++) {
        if (g[r][c] && !connected.has(`${r},${c}`)) {
          g[r][c] = null;
          removed++;
        }
      }
    }
    return removed;
  };

  const snapBubble = useCallback((bx: number, by: number, color: string) => {
    // Find closest grid position
    let bestR = 0, bestC = 0, bestDist = Infinity;
    for (let r = 0; r < ROWS; r++) {
      const maxC = r % 2 === 1 ? COLS - 1 : COLS;
      for (let c = 0; c < maxC; c++) {
        const gx = getX(r, c);
        const gy = getY(r);
        const dist = Math.hypot(bx - gx, by - gy);
        if (dist < bestDist && !gridRef.current[r]?.[c]) {
          bestDist = dist;
          bestR = r;
          bestC = c;
        }
      }
    }

    const newGrid = gridRef.current.map(row => [...row]);
    newGrid[bestR][bestC] = color;

    // Check cluster
    const cluster = findCluster(newGrid, bestR, bestC, color);
    let points = 0;
    if (cluster.length >= 3) {
      for (const [r, c] of cluster) {
        newGrid[r][c] = null;
        points += 10;
      }
      const floatRemoved = removeFloating(newGrid);
      points += floatRemoved * 15;
    }

    // Check game over
    const lastRow = newGrid[ROWS - 1];
    if (lastRow.some(c => c !== null)) {
      setGameOver(true);
    }

    gridRef.current = newGrid;
    setGrid(newGrid);
    setScore(s => s + points);
    
    setCurrentColor(nextColor);
    setNextColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    isShooting.current = false;
  }, [nextColor]);

  const shoot = useCallback(() => {
    if (isShooting.current || gameOver) return;
    isShooting.current = true;

    const speed = 8;
    const startX = CANVAS_WIDTH / 2;
    const startY = CANVAS_HEIGHT - 30;

    shootingRef.current = {
      x: startX,
      y: startY,
      dx: Math.cos(aimAngle) * speed,
      dy: Math.sin(aimAngle) * speed,
      color: currentColor,
    };

    const animate = () => {
      const b = shootingRef.current;
      if (!b) return;

      b.x += b.dx;
      b.y += b.dy;

      // Wall bounce
      if (b.x < BUBBLE_RADIUS || b.x > CANVAS_WIDTH - BUBBLE_RADIUS) {
        b.dx = -b.dx;
        b.x = Math.max(BUBBLE_RADIUS, Math.min(CANVAS_WIDTH - BUBBLE_RADIUS, b.x));
      }

      // Ceiling
      if (b.y < BUBBLE_RADIUS) {
        shootingRef.current = null;
        snapBubble(b.x, b.y, b.color);
        return;
      }

      // Check collision with existing bubbles
      for (let r = 0; r < ROWS; r++) {
        const maxC = r % 2 === 1 ? COLS - 1 : COLS;
        for (let c = 0; c < maxC; c++) {
          if (!gridRef.current[r]?.[c]) continue;
          const gx = getX(r, c);
          const gy = getY(r);
          if (Math.hypot(b.x - gx, b.y - gy) < BUBBLE_DIAMETER - 2) {
            shootingRef.current = null;
            snapBubble(b.x, b.y, b.color);
            return;
          }
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
  }, [aimAngle, currentColor, gameOver, snapBubble]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    
    let drawFrame: number;
    const draw = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      bg.addColorStop(0, 'hsl(270, 30%, 12%)');
      bg.addColorStop(1, 'hsl(330, 20%, 8%)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Grid bubbles
      for (let r = 0; r < ROWS; r++) {
        const maxC = r % 2 === 1 ? COLS - 1 : COLS;
        for (let c = 0; c < maxC; c++) {
          const color = grid[r]?.[c];
          if (!color) continue;
          const x = getX(r, c);
          const y = getY(r);
          
          ctx.beginPath();
          ctx.arc(x, y, BUBBLE_RADIUS - 1, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          
          // Shine
          ctx.beginPath();
          ctx.arc(x - 4, y - 4, 5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.fill();
        }
      }

      // Shooting bubble
      const b = shootingRef.current;
      if (b) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, BUBBLE_RADIUS - 1, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
      }

      // Aim line
      if (!isShooting.current) {
        const sx = CANVAS_WIDTH / 2;
        const sy = CANVAS_HEIGHT - 30;
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(aimAngle) * 80, sy + Math.sin(aimAngle) * 80);
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);

        // Current bubble at shooter
        ctx.beginPath();
        ctx.arc(sx, sy, BUBBLE_RADIUS - 1, 0, Math.PI * 2);
        ctx.fillStyle = currentColor;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx - 4, sy - 4, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fill();

        // Next bubble
        ctx.beginPath();
        ctx.arc(sx - 40, sy + 10, 12, 0, Math.PI * 2);
        ctx.fillStyle = nextColor;
        ctx.fill();
        ctx.font = '9px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('next', sx - 52, sy + 30);
      }

      drawFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(drawFrame);
  }, [grid, currentColor, nextColor, aimAngle]);

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isShooting.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    
    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const mx = (clientX - rect.left) * scaleX;
    const my = (clientY - rect.top) * scaleY;
    const sx = CANVAS_WIDTH / 2;
    const sy = CANVAS_HEIGHT - 30;
    const angle = Math.atan2(my - sy, mx - sx);
    // Clamp to upward angles
    if (angle < -0.15 && angle > -Math.PI + 0.15) {
      setAimAngle(angle);
    }
  };

  const handleClick = () => {
    if (!gameOver) shoot();
  };

  const resetGame = () => {
    setGameOver(false);
    setScore(0);
    isShooting.current = false;
    shootingRef.current = null;
    initGrid();
    setCurrentColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    setNextColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
  };

  // Check win
  const allClear = grid.length > 0 && grid.every(row => row.every(c => c === null));

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-[380px] px-2">
        <div className="text-sm font-body text-muted-foreground">
          Score: <span className="text-primary font-display text-lg">{score}</span>
        </div>
        <button
          onClick={resetGame}
          className="text-xs text-muted-foreground hover:text-primary transition-colors font-body"
        >
          🔄 Reset
        </button>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-primary/20 shadow-lg">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="cursor-crosshair max-w-full"
          style={{ width: Math.min(CANVAS_WIDTH, 380), height: 'auto' }}
          onMouseMove={handleCanvasMove}
          onTouchMove={handleCanvasMove}
          onClick={handleClick}
          onTouchEnd={handleClick}
        />

        {(gameOver || allClear) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
          >
            <p className="text-2xl font-display text-primary">
              {allClear ? '🎉 You cleared it!' : '💫 Game Over!'}
            </p>
            <p className="text-muted-foreground font-body">Score: {score}</p>
            <button
              onClick={resetGame}
              className="px-6 py-2 rounded-full bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 transition-all font-body text-sm"
            >
              Play Again
            </button>
          </motion.div>
        )}
      </div>

      <p className="text-xs text-muted-foreground/60 font-body text-center">
        Aim with mouse/touch • Click to shoot • Match 3+ to pop!
      </p>
    </div>
  );
};

export default BubbleShooterGame;
