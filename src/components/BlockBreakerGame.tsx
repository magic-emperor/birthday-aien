import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CANVAS_W = 480;
const CANVAS_H = 640;
const PADDLE_W = 80;
const PADDLE_H = 14;
const BALL_R = 7;
const BRICK_ROWS = 6;
const BRICK_COLS = 8;
const BRICK_W = CANVAS_W / BRICK_COLS - 4;
const BRICK_H = 20;
const BRICK_PAD = 4;
const MILESTONE = 1000;

const REWARD_MESSAGES = [
  { text: "You're a star, Aien! Keep shining! ⭐", emoji: "🌟" },
  { text: "Mehnaz = Unstoppable! Nothing can stop you! 💪", emoji: "🔥" },
  { text: "25 and absolutely thriving! 🎉", emoji: "🎂" },
  { text: "You make everything beautiful, even brick-breaking! 😂", emoji: "💖" },
  { text: "MashaAllah! You're on fire! 🔥", emoji: "✨" },
  { text: "The birthday queen conquers all! 👑", emoji: "👑" },
];

const BRICK_COLORS = [
  'hsl(340, 45%, 55%)',
  'hsl(25, 90%, 58%)',
  'hsl(40, 85%, 55%)',
  'hsl(20, 70%, 65%)',
  'hsl(350, 50%, 50%)',
  'hsl(30, 80%, 50%)',
];

interface Brick {
  x: number;
  y: number;
  alive: boolean;
  color: string;
}

const BlockBreakerGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [rewards, setRewards] = useState<typeof REWARD_MESSAGES>([]);
  const [showReward, setShowReward] = useState<(typeof REWARD_MESSAGES)[0] | null>(null);
  const [lives, setLives] = useState(3);

  const gameState = useRef({
    paddleX: CANVAS_W / 2 - PADDLE_W / 2,
    ballX: CANVAS_W / 2,
    ballY: CANVAS_H - 40,
    ballDX: 3,
    ballDY: -3,
    bricks: [] as Brick[],
    score: 0,
    lives: 3,
    lastMilestone: 0,
    animationId: 0,
    paused: false,
  });

  const initBricks = useCallback(() => {
    const bricks: Brick[] = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        bricks.push({
          x: c * (BRICK_W + BRICK_PAD) + BRICK_PAD / 2 + 2,
          y: r * (BRICK_H + BRICK_PAD) + 50,
          alive: true,
          color: BRICK_COLORS[r % BRICK_COLORS.length],
        });
      }
    }
    return bricks;
  }, []);

  const resetBall = useCallback(() => {
    const gs = gameState.current;
    gs.ballX = CANVAS_W / 2;
    gs.ballY = CANVAS_H - 40;
    gs.ballDX = 3 * (Math.random() > 0.5 ? 1 : -1);
    gs.ballDY = -3;
  }, []);

  const startGame = useCallback(() => {
    const gs = gameState.current;
    gs.bricks = initBricks();
    gs.score = 0;
    gs.lives = 3;
    gs.lastMilestone = 0;
    gs.paddleX = CANVAS_W / 2 - PADDLE_W / 2;
    resetBall();
    setScore(0);
    setLives(3);
    setGameOver(false);
    setRewards([]);
    setShowReward(null);
    setGameStarted(true);
  }, [initBricks, resetBall]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const gs = gameState.current;

    const handleMove = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_W / rect.width;
      gs.paddleX = Math.max(0, Math.min(CANVAS_W - PADDLE_W, (clientX - rect.left) * scaleX - PADDLE_W / 2));
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleMove(e.touches[0].clientX);
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });

    const loop = () => {
      if (gs.paused) {
        gs.animationId = requestAnimationFrame(loop);
        return;
      }

      // Move ball
      gs.ballX += gs.ballDX;
      gs.ballY += gs.ballDY;

      // Wall collisions
      if (gs.ballX - BALL_R <= 0 || gs.ballX + BALL_R >= CANVAS_W) gs.ballDX *= -1;
      if (gs.ballY - BALL_R <= 0) gs.ballDY *= -1;

      // Paddle collision
      if (
        gs.ballY + BALL_R >= CANVAS_H - PADDLE_H - 10 &&
        gs.ballY + BALL_R <= CANVAS_H - 10 &&
        gs.ballX >= gs.paddleX &&
        gs.ballX <= gs.paddleX + PADDLE_W
      ) {
        gs.ballDY = -Math.abs(gs.ballDY);
        const hitPos = (gs.ballX - gs.paddleX) / PADDLE_W - 0.5;
        gs.ballDX = hitPos * 6;
      }

      // Ball falls
      if (gs.ballY + BALL_R > CANVAS_H) {
        gs.lives--;
        setLives(gs.lives);
        if (gs.lives <= 0) {
          setGameOver(true);
          return;
        }
        resetBall();
      }

      // Brick collisions
      for (const brick of gs.bricks) {
        if (!brick.alive) continue;
        if (
          gs.ballX + BALL_R > brick.x &&
          gs.ballX - BALL_R < brick.x + BRICK_W &&
          gs.ballY + BALL_R > brick.y &&
          gs.ballY - BALL_R < brick.y + BRICK_H
        ) {
          brick.alive = false;
          gs.ballDY *= -1;
          gs.score += 100;
          setScore(gs.score);

          // Check milestone
          const milestoneCount = Math.floor(gs.score / MILESTONE);
          if (milestoneCount > gs.lastMilestone && milestoneCount <= REWARD_MESSAGES.length) {
            gs.lastMilestone = milestoneCount;
            gs.paused = true;
            const reward = REWARD_MESSAGES[milestoneCount - 1];
            setRewards((prev) => [...prev, reward]);
            setShowReward(reward);
            setTimeout(() => {
              setShowReward(null);
              gs.paused = false;
            }, 2500);
          }

          // Regenerate bricks if all destroyed
          if (gs.bricks.every((b) => !b.alive)) {
            gs.bricks = initBricks();
          }
          break;
        }
      }

      // Draw
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      bgGrad.addColorStop(0, 'hsl(30, 40%, 6%)');
      bgGrad.addColorStop(1, 'hsl(15, 60%, 10%)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Bricks
      for (const brick of gs.bricks) {
        if (!brick.alive) continue;
        ctx.fillStyle = brick.color;
        ctx.beginPath();
        const br = 4;
        ctx.roundRect(brick.x, brick.y, BRICK_W, BRICK_H, br);
        ctx.fill();
        // Shine
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(brick.x + 2, brick.y + 2, BRICK_W - 4, BRICK_H / 3);
      }

      // Paddle
      const paddleGrad = ctx.createLinearGradient(gs.paddleX, 0, gs.paddleX + PADDLE_W, 0);
      paddleGrad.addColorStop(0, 'hsl(25, 90%, 58%)');
      paddleGrad.addColorStop(1, 'hsl(340, 45%, 55%)');
      ctx.fillStyle = paddleGrad;
      ctx.beginPath();
      ctx.roundRect(gs.paddleX, CANVAS_H - PADDLE_H - 10, PADDLE_W, PADDLE_H, 7);
      ctx.fill();

      // Ball glow
      ctx.shadowColor = 'hsl(25, 90%, 58%)';
      ctx.shadowBlur = 15;
      ctx.fillStyle = 'hsl(40, 85%, 55%)';
      ctx.beginPath();
      ctx.arc(gs.ballX, gs.ballY, BALL_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      gs.animationId = requestAnimationFrame(loop);
    };

    gs.animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(gs.animationId);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchmove', onTouchMove);
    };
  }, [gameStarted, gameOver, initBricks, resetBall]);

  return (
    <section className="py-32 px-4 relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12 relative z-10"
      >
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4 font-body">
          Time to play
        </p>
        <h2 className="text-3xl md:text-5xl font-display text-gradient-sunset">
          Birthday Brick Breaker
        </h2>
        <p className="text-muted-foreground mt-4 font-body text-sm max-w-md mx-auto">
          Break bricks, collect rewards! Every 1,000 points unlocks a surprise 🎁
        </p>
      </motion.div>

      <div className="max-w-lg mx-auto relative z-10">
        {!gameStarted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="bg-card/60 backdrop-blur-sm border border-primary/20 rounded-2xl p-12">
              <div className="text-6xl mb-6">🎮</div>
              <h3 className="text-2xl font-display text-primary mb-4">Ready to Play?</h3>
              <p className="text-foreground/60 font-body text-sm mb-8">
                Move the paddle to bounce the ball and break all the bricks!<br />
                Surprise rewards await every 1,000 points.
              </p>
              <button
                onClick={startGame}
                className="px-8 py-3 rounded-xl bg-gradient-sunset text-primary-foreground font-body font-semibold hover:opacity-90 transition-opacity"
              >
                Start Game ✦
              </button>
            </div>
          </motion.div>
        ) : gameOver ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="bg-card/60 backdrop-blur-sm border border-primary/20 rounded-2xl p-8 md:p-12">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-2xl font-display text-primary mb-2">Game Over!</h3>
              <p className="text-3xl font-display text-foreground mb-6">{score} points</p>

              {rewards.length > 0 && (
                <div className="mb-8">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                    Rewards Collected ({rewards.length}/{REWARD_MESSAGES.length})
                  </p>
                  <div className="space-y-3">
                    {rewards.map((r, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                        className="bg-secondary/40 rounded-xl p-4 border border-primary/10 flex items-center gap-3"
                      >
                        <span className="text-2xl">{r.emoji}</span>
                        <span className="text-sm text-foreground/80 font-body text-left">{r.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {rewards.length === 0 && (
                <p className="text-foreground/60 font-body text-sm mb-6">
                  Try again to unlock surprise rewards! 🎁
                </p>
              )}

              <button
                onClick={startGame}
                className="px-8 py-3 rounded-xl bg-gradient-sunset text-primary-foreground font-body font-semibold hover:opacity-90 transition-opacity"
              >
                Play Again ✦
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="relative">
            {/* HUD */}
            <div className="flex justify-between items-center mb-4 px-2">
              <div className="flex gap-1">
                {Array.from({ length: 3 }, (_, i) => (
                  <span key={i} className={`text-lg ${i < lives ? 'opacity-100' : 'opacity-20'}`}>
                    ❤️
                  </span>
                ))}
              </div>
              <p className="text-lg font-display text-primary">{score} pts</p>
            </div>

            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="w-full max-w-[480px] mx-auto rounded-2xl border border-primary/20 cursor-none touch-none"
            />

            {/* Reward popup */}
            <AnimatePresence>
              {showReward && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="bg-card/90 backdrop-blur-md border border-primary/30 rounded-2xl p-8 text-center glow-warm">
                    <div className="text-5xl mb-3">{showReward.emoji}</div>
                    <p className="text-sm font-body text-foreground/90">{showReward.text}</p>
                    <p className="text-xs text-primary mt-2">{MILESTONE * rewards.length} points!</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlockBreakerGame;
