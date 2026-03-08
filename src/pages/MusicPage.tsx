import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

const MusicPage: React.FC = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handlePaste = useCallback(() => {
    setError('');
    const id = extractVideoId(url.trim());
    if (id) {
      setCurrentVideoId(id);
      setUrl('');
    } else {
      setError('Hmm, that doesn\'t look right. Try a link like https://youtube.com/watch?v=...');
    }
  }, [url]);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[hsl(230,40%,8%)] via-[hsl(225,35%,12%)] to-[hsl(220,30%,6%)] overflow-y-auto">
      {/* Stars background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 60 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/60"
            style={{
              width: 1 + Math.random() * 2,
              height: 1 + Math.random() * 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 70}%`,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-sm text-white/80 hover:bg-white/20 transition-all"
        >
          ← Back
        </button>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 pb-12">
        {/* Title & message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-display text-white/90 mb-3">🎵 Your Song, Your Moment</h1>
          <p className="text-white/50 font-body text-sm md:text-base italic leading-relaxed max-w-md mx-auto">
            Aien, pick a song that makes your heart smile — paste it here and let the music play while my love wraps around every note ♥
          </p>
        </motion.div>

        {/* Paste input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2 mb-6"
        >
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePaste()}
            placeholder="Paste a YouTube link here..."
            className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 font-body text-sm focus:outline-none focus:border-white/30 transition-colors"
          />
          <button
            onClick={handlePaste}
            className="px-6 py-3 rounded-xl bg-white/15 border border-white/15 text-white text-sm font-body hover:bg-white/25 transition-all"
          >
            Play ▶
          </button>
        </motion.div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400/80 mb-4 font-body">{error}</p>
        )}

        {/* Player */}
        <AnimatePresence mode="wait">
          {currentVideoId && (
            <motion.div
              key={currentVideoId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40"
            >
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&rel=0`}
                  title="YouTube player"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!currentVideoId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-16"
          >
            <p className="text-5xl mb-4">🎶</p>
            <p className="text-white/30 font-body text-xs">
              Find your song on YouTube, copy the link, and paste it above
            </p>
          </motion.div>
        )}
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default MusicPage;
