import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import playlist, { Song } from '@/data/playlist';

function extractYoutubeId(input: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = input.trim().match(p);
    if (m) return m[1];
  }
  return null;
}

const MusicPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isYoutubeUrl = useMemo(() => extractYoutubeId(searchQuery) !== null, [searchQuery]);

  const handlePlayUrl = useCallback(() => {
    const id = extractYoutubeId(searchQuery);
    if (id) {
      const song: Song = { name: 'YouTube Video', artist: 'From URL', youtubeId: id, emoji: '🔗' };
      setCurrentSong(song);
    }
  }, [searchQuery]);

  const filteredPlaylist = useMemo(() => {
    if (!searchQuery.trim() || isYoutubeUrl) return playlist;
    const q = searchQuery.toLowerCase();
    return playlist.filter(s => s.name.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q));
  }, [searchQuery, isYoutubeUrl]);

  const audioBars = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      delay: (i * 0.08) % 1.2,
      height: 20 + Math.random() * 60,
    })), []
  );

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[hsl(230,40%,8%)] via-[hsl(225,35%,12%)] to-[hsl(220,30%,6%)] overflow-y-auto">
      {/* Stars */}
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
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-display text-white/90 mb-3">🎵 Your Song, Your Moment</h1>
          <p className="text-white/50 font-body text-sm md:text-base italic leading-relaxed max-w-md mx-auto">
            Aien, pick a song that makes your heart smile — let the music play while my love wraps around every note ♥
          </p>
        </motion.div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="🔍 Search songs or paste YouTube link..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && isYoutubeUrl && handlePlayUrl()}
              className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 text-sm font-body placeholder:text-white/30 focus:outline-none focus:border-white/25 focus:bg-white/8 transition-all backdrop-blur-md pr-20"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {isYoutubeUrl && (
                <button
                  onClick={handlePlayUrl}
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-[hsl(310,45%,55%)] to-[hsl(330,60%,65%)] text-white text-xs font-body hover:opacity-90 transition-all"
                >
                  ▶ Play
                </button>
              )}
              {searchQuery && !isYoutubeUrl && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-white/30 hover:text-white/60 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Player — right below search */}
        {currentSong && (
          <div className="mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <button
                onClick={() => setIsAudioOnly(false)}
                className={`px-4 py-2 rounded-full text-xs font-body transition-all ${
                  !isAudioOnly ? 'bg-white/20 text-white border border-white/20' : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'
                }`}
              >
                🎬 Video
              </button>
              <button
                onClick={() => setIsAudioOnly(true)}
                className={`px-4 py-2 rounded-full text-xs font-body transition-all ${
                  isAudioOnly ? 'bg-white/20 text-white border border-white/20' : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'
                }`}
              >
                🎧 Audio Only
              </button>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSong.youtubeId + (isAudioOnly ? '-a' : '-v')}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                {isAudioOnly ? (
                  <>
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 max-w-md mx-auto">
                      <div className="relative w-full" style={{ height: 1, overflow: 'hidden', opacity: 0 }}>
                        <iframe
                          src={`https://www.youtube.com/embed/${currentSong.youtubeId}?autoplay=1&playsinline=1&rel=0`}
                          title="Audio playback"
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                          className="absolute inset-0 w-full"
                          style={{ height: 200 }}
                        />
                      </div>
                      <div className="py-12 px-6">
                        <div className="flex items-end justify-center gap-1 h-20 mb-6">
                          {audioBars.map((bar, i) => (
                            <motion.div
                              key={i}
                              className="w-1.5 rounded-full bg-gradient-to-t from-white/20 to-white/60"
                              animate={{ height: [bar.height * 0.3, bar.height, bar.height * 0.5, bar.height * 0.8, bar.height * 0.3] }}
                              transition={{ duration: 1.2, repeat: Infinity, delay: bar.delay, ease: 'easeInOut' }}
                            />
                          ))}
                        </div>
                        <p className="text-center text-white/60 font-body text-sm font-medium">{currentSong.name}</p>
                        <p className="text-center text-white/30 font-body text-xs mt-1">{currentSong.artist}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40">
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        src={`https://www.youtube.com/embed/${currentSong.youtubeId}?autoplay=1&rel=0`}
                        title="YouTube player"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Song list */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid gap-2 mb-8"
        >
          {filteredPlaylist.length === 0 && !currentSong && (
            <p className="text-center text-white/30 font-body text-sm py-6">No songs found ✦</p>
          )}
          {filteredPlaylist.map((song, i) => (
            <motion.button
              key={song.youtubeId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              onClick={() => setCurrentSong(song)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left ${
                currentSong?.youtubeId === song.youtubeId
                  ? 'bg-white/15 border border-white/20 shadow-lg shadow-white/5'
                  : 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10'
              }`}
            >
              <span className="text-2xl flex-shrink-0">{song.emoji || '🎵'}</span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-body font-medium ${
                  currentSong?.youtubeId === song.youtubeId ? 'text-white' : 'text-white/80'
                }`}>
                  {song.name}
                </p>
                <p className="text-xs text-white/40 font-body">{song.artist}</p>
              </div>
              {currentSong?.youtubeId === song.youtubeId && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex gap-0.5 items-end h-4"
                >
                  {[1, 2, 3].map(n => (
                    <motion.div
                      key={n}
                      className="w-1 bg-white/60 rounded-full"
                      animate={{ height: [4, 12 + n * 2, 6, 14, 4] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: n * 0.15 }}
                    />
                  ))}
                </motion.div>
              )}
            </motion.button>
          ))}
        </motion.div>

        {!currentSong && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center py-10">
            <p className="text-4xl mb-3">🎶</p>
            <p className="text-white/30 font-body text-xs">Pick a song from the list above</p>
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
