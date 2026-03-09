import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CARD_PAIRS = [
  { id: 1, emoji: '💕', name: 'Hearts' },
  { id: 2, emoji: '🌸', name: 'Blossom' },
  { id: 3, emoji: '✨', name: 'Sparkle' },
  { id: 4, emoji: '🎂', name: 'Cake' },
  { id: 5, emoji: '👑', name: 'Crown' },
  { id: 6, emoji: '🦋', name: 'Butterfly' },
  { id: 7, emoji: '🌙', name: 'Moon' },
  { id: 8, emoji: '💫', name: 'Star' },
];

const LOVE_MESSAGES = [
  "You're amazing! 💕",
  "Keep going, beautiful! ✨",
  "You've got this! 🌟",
  "So proud of you! 👑",
  "You're a star! ⭐",
  "Perfect match! 💖",
];

interface Card {
  id: number;
  pairId: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryMatchGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [message, setMessage] = useState('');

  const initGame = () => {
    const shuffledCards: Card[] = [];
    const pairs = [...CARD_PAIRS, ...CARD_PAIRS];
    
    // Shuffle
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }

    pairs.forEach((pair, index) => {
      shuffledCards.push({
        id: index,
        pairId: pair.id,
        emoji: pair.emoji,
        isFlipped: false,
        isMatched: false,
      });
    });

    setCards(shuffledCards);
    setFlippedCards([]);
    setMatches(0);
    setMoves(0);
    setGameWon(false);
    setMessage('');
    setGameStarted(true);
  };

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length >= 2) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newCards = cards.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);
    setFlippedCards([...flippedCards, cardId]);
  };

  useEffect(() => {
    if (flippedCards.length === 2) {
      setMoves(m => m + 1);
      
      const [first, second] = flippedCards;
      const firstCard = cards.find(c => c.id === first);
      const secondCard = cards.find(c => c.id === second);

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        // Match found!
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === first || c.id === second ? { ...c, isMatched: true } : c
          ));
          setMatches(m => m + 1);
          setFlippedCards([]);
          setMessage(LOVE_MESSAGES[Math.floor(Math.random() * LOVE_MESSAGES.length)]);
          setTimeout(() => setMessage(''), 1500);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === first || c.id === second ? { ...c, isFlipped: false } : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards, cards]);

  useEffect(() => {
    if (matches === CARD_PAIRS.length && gameStarted) {
      setGameWon(true);
    }
  }, [matches, gameStarted]);

  return (
    <div className="w-full">
      {!gameStarted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="bg-card/60 backdrop-blur-sm border border-primary/20 rounded-2xl p-12">
            <div className="text-6xl mb-6">🧠</div>
            <h3 className="text-2xl font-display text-primary mb-4">Memory Match</h3>
            <p className="text-foreground/60 font-body text-sm mb-8">
              Flip cards to find matching pairs!<br />
              Test your memory and collect sweet messages 💕
            </p>
            <button
              onClick={initGame}
              className="px-8 py-3 rounded-xl bg-gradient-sunset text-primary-foreground font-body font-semibold hover:opacity-90 transition-opacity"
            >
              Start Game ✦
            </button>
          </div>
        </motion.div>
      ) : gameWon ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="bg-card/60 backdrop-blur-sm border border-primary/20 rounded-2xl p-8 md:p-12">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-2xl font-display text-primary mb-2">You Won!</h3>
            <p className="text-foreground/70 font-body mb-2">
              Completed in <span className="text-primary font-semibold">{moves}</span> moves
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {moves <= 12 ? "Perfect memory! 🧠✨" : moves <= 18 ? "Great job! 🌟" : "You did it! 💕"}
            </p>
            <button
              onClick={initGame}
              className="px-8 py-3 rounded-xl bg-gradient-sunset text-primary-foreground font-body font-semibold hover:opacity-90 transition-opacity"
            >
              Play Again ✦
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="relative">
          {/* Stats */}
          <div className="flex justify-between items-center mb-4 px-2">
            <p className="text-sm font-body text-muted-foreground">
              Matches: <span className="text-primary font-semibold">{matches}/{CARD_PAIRS.length}</span>
            </p>
            <p className="text-sm font-body text-muted-foreground">
              Moves: <span className="text-primary font-semibold">{moves}</span>
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-4 gap-2 md:gap-3 max-w-md mx-auto">
            {cards.map((card) => (
              <motion.button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`aspect-square rounded-xl border-2 transition-all duration-300 ${
                  card.isMatched 
                    ? 'bg-pink-500/20 border-pink-500/40' 
                    : card.isFlipped 
                      ? 'bg-card border-primary/40' 
                      : 'bg-card/60 border-primary/20 hover:border-primary/40'
                }`}
                whileHover={{ scale: card.isFlipped || card.isMatched ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {(card.isFlipped || card.isMatched) ? (
                    <motion.span
                      key="emoji"
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-3xl md:text-4xl"
                    >
                      {card.emoji}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="back"
                      initial={{ rotateY: -90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-2xl md:text-3xl text-primary/30"
                    >
                      ?
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>

          {/* Match Message */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card/95 backdrop-blur-md border border-primary/30 rounded-2xl px-6 py-4 shadow-xl"
              >
                <p className="text-lg font-body text-primary">{message}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default MemoryMatchGame;
