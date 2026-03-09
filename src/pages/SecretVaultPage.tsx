import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, Unlock, Heart, Gift, Star, Sparkles, Image, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FallingPetals from '@/components/FallingPetals';
import PartyBlasters from '@/components/PartyBlasters';

// Secret messages - add your own!
// Add your photos to: src/assets/vault/
// 1. special-memory.jpg
// 2. favorite-photo.jpg
import specialMemory from '@/assets/vault/special-memory.jpg';
import favoritePhoto from '@/assets/vault/favorite-photo.jpg';

const secretMessages = [
  {
    id: 1,
    type: 'message',
    emoji: '💕',
    title: 'My First Secret',
    content: "The moment I knew I loved you was when we first met and you were being a child with me and being mad at me 🥺💕",
  },
  {
    id: 2,
    type: 'message',
    emoji: '🌟',
    title: 'What I Adore Most',
    content: "Perfect, my love and my soulmate ✨💖",
  },
  {
    id: 3,
    type: 'message',
    emoji: '🔮',
    title: 'A Promise',
    content: "I promise to love you through every season, every challenge, every adventure that awaits us.",
  },
  {
    id: 4,
    type: 'image',
    emoji: '📸',
    title: 'Our Special Memory',
    content: specialMemory,
    caption: "Remember this moment?",
  },
  {
    id: 5,
    type: 'message',
    emoji: '🎁',
    title: 'Birthday Wish',
    content: "May your 25th year be filled with magic, laughter, and dreams coming true!",
  },
  {
    id: 6,
    type: 'message',
    emoji: '💌',
    title: 'A Love Letter',
    content: "Aien Meri jaan, you are the reason I believe in soulmates... 💕",
  },
  {
    id: 7,
    type: 'image',
    emoji: '🌸',
    title: 'My Favorite Photo of You',
    content: favoritePhoto,
    caption: "You looked so beautiful here",
  },
  {
    id: 8,
    type: 'message',
    emoji: '🎂',
    title: 'Birthday Confession',
    content: "I've been planning this for months just to see you smile today!",
  },
  {
    id: 9,
    type: 'message',
    emoji: '💫',
    title: 'Our Future',
    content: "I can't wait to build our forever together. Here's to 25 and beyond!",
  },
];

const SecretVaultPage: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [selectedItem, setSelectedItem] = useState<typeof secretMessages[0] | null>(null);
  const [revealedItems, setRevealedItems] = useState<number[]>([]);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showParty, setShowParty] = useState(false);

  // Trigger party when all items revealed
  useEffect(() => {
    if (revealedItems.length === secretMessages.length && !showParty) {
      setShowParty(true);
    }
  }, [revealedItems, showParty]);

  // Check if it's birthday (April 7)
  const checkBirthday = () => {
    const now = new Date();
    const birthdayMonth = 3; // April (0-indexed)
    const birthdayDay = 7;
    
    return now.getMonth() === birthdayMonth && now.getDate() === birthdayDay;
  };

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      let birthday = new Date(currentYear, 3, 7); // April 7

      // If birthday has passed this year, use next year
      if (now > birthday) {
        birthday = new Date(currentYear + 1, 3, 7);
      }

      // Check if it's birthday
      if (checkBirthday()) {
        setIsUnlocked(true);
        return;
      }

      const diff = birthday.getTime() - now.getTime();

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleItemClick = (item: typeof secretMessages[0]) => {
    setSelectedItem(item);
    if (!revealedItems.includes(item.id)) {
      setRevealedItems([...revealedItems, item.id]);
    }
  };

  // For testing - remove in production!
  const forceUnlock = () => setIsUnlocked(true);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FallingPetals />
      <PartyBlasters show={showParty} />
      
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/10 pointer-events-none" />

      {/* Back button */}
      <a
        href="/"
        className="fixed top-6 left-6 z-50 w-12 h-12 rounded-full bg-background/40 backdrop-blur-md border border-primary/20 flex items-center justify-center hover:bg-background/60 transition-all duration-300 shadow-lg"
      >
        <ArrowLeft className="w-5 h-5 text-foreground" />
      </a>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        <AnimatePresence mode="wait">
          {!isUnlocked ? (
            // Locked state
            <motion.div
              key="locked"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center max-w-lg"
            >
              {/* Lock animation */}
              <motion.div
                animate={{ 
                  rotate: [0, -5, 5, -5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="mb-8"
              >
                <div className="w-32 h-32 mx-auto rounded-full bg-card/60 backdrop-blur-xl border-2 border-primary/30 flex items-center justify-center shadow-2xl">
                  <Lock className="w-16 h-16 text-primary" />
                </div>
              </motion.div>

              <h1 className="text-3xl md:text-5xl font-display text-gradient-sunset mb-4">
                Secret Birthday Vault
              </h1>
              
              <p className="text-lg text-muted-foreground font-body mb-8">
                This treasure chest of surprises unlocks on your special day! 🎂
              </p>

              {/* Countdown */}
              <div className="bg-card/60 backdrop-blur-xl rounded-2xl border border-primary/20 p-6 mb-8">
                <p className="text-sm text-muted-foreground mb-4 font-body">Unlocks in...</p>
                <div className="flex justify-center gap-4">
                  {[
                    { value: countdown.days, label: 'Days' },
                    { value: countdown.hours, label: 'Hours' },
                    { value: countdown.minutes, label: 'Min' },
                    { value: countdown.seconds, label: 'Sec' },
                  ].map((item, i) => (
                    <div key={i} className="text-center">
                      <motion.div
                        key={item.value}
                        initial={{ y: -5, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-2xl md:text-3xl font-display text-primary"
                      >
                        {String(item.value).padStart(2, '0')}
                      </motion.div>
                      <p className="text-xs text-muted-foreground font-body">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teaser */}
              <div className="flex justify-center gap-3 mb-8">
                {secretMessages.slice(0, 5).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      y: [0, -5, 0],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      delay: i * 0.2,
                    }}
                    className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center"
                  >
                    <Gift className="w-5 h-5 text-primary/50" />
                  </motion.div>
                ))}
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-primary/50 font-body text-sm">+{secretMessages.length - 5}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground/60 font-body">
                {secretMessages.length} surprises waiting for you! 💝
              </p>

              {/* Debug button - remove in production! */}
              <button 
                onClick={forceUnlock}
                className="mt-8 text-xs text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
              >
                (Debug: Unlock for testing)
              </button>
            </motion.div>
          ) : (
            // Unlocked state
            <motion.div
              key="unlocked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-4xl"
            >
              {/* Header */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-12"
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Unlock className="w-8 h-8 text-primary" />
                  <h1 className="text-3xl md:text-5xl font-display text-gradient-sunset">
                    Happy Birthday! 🎂
                  </h1>
                  <Unlock className="w-8 h-8 text-primary" />
                </div>
                <p className="text-lg text-muted-foreground font-body">
                  Your secret vault is now open! Tap each card to reveal a surprise 💝
                </p>
                <p className="text-sm text-primary/60 font-body mt-2">
                  {revealedItems.length} of {secretMessages.length} revealed
                </p>
              </motion.div>

              {/* Grid of secrets */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {secretMessages.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleItemClick(item)}
                    className={`relative aspect-square rounded-2xl border-2 transition-all duration-300 overflow-hidden group ${
                      revealedItems.includes(item.id)
                        ? 'bg-primary/10 border-primary/40'
                        : 'bg-card/60 border-primary/20 hover:border-primary/40'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Sparkle effect */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 pointer-events-none"
                    >
                      <Star className="absolute top-2 right-2 w-3 h-3 text-primary/30" />
                      <Star className="absolute bottom-4 left-3 w-2 h-2 text-primary/20" />
                    </motion.div>

                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                      <span className="text-4xl md:text-5xl mb-2">{item.emoji}</span>
                      <p className="text-sm font-body text-muted-foreground text-center line-clamp-2">
                        {item.title}
                      </p>
                      {revealedItems.includes(item.id) && (
                        <span className="absolute top-2 right-2 text-xs text-primary">✓</span>
                      )}
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                ))}
              </div>

              {/* Completion message */}
              {revealedItems.length === secretMessages.length && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-12"
                >
                  <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20">
                    <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
                    <p className="text-xl font-display text-primary mb-2">
                      You've unlocked everything! 🎉
                    </p>
                    <p className="text-muted-foreground font-body">
                      But the biggest surprise is how much you mean to me, Aien. 
                      Happy 25th Birthday! 💕
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedItem(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-card rounded-3xl border border-primary/20 p-8 max-w-md w-full shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="text-center">
                  <span className="text-6xl mb-4 block">{selectedItem.emoji}</span>
                  <h3 className="text-2xl font-display text-primary mb-4">
                    {selectedItem.title}
                  </h3>
                  
                  {selectedItem.type === 'image' ? (
                    <div className="mb-4">
                      <img 
                        src={selectedItem.content} 
                        alt={selectedItem.title}
                        className="w-full rounded-xl mb-2"
                      />
                      <p className="text-muted-foreground font-body italic">
                        {(selectedItem as any).caption}
                      </p>
                    </div>
                  ) : (
                    <p className="text-lg font-body text-foreground/80 mb-6">
                      {selectedItem.content}
                    </p>
                  )}
                  
                  <Button onClick={() => setSelectedItem(null)} className="rounded-full">
                    <Heart className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SecretVaultPage;
