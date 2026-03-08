import React, { useState, useCallback, useMemo } from 'react';
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

interface SearchResult {
  videoId: string;
  title: string;
  thumbnail: string;
  uploaderName: string;
}

const MusicPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async () => {
    if (!query.trim()) return;
    setError('');

    // Check if it's a YouTube URL first
    const videoId = extractVideoId(query.trim());
    if (videoId) {
      setCurrentVideoId(videoId);
      setQuery('');
      setSearchResults([]);
      return;
    }

    // Otherwise search
    setIsSearching(true);
    setSearchResults([]);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('youtube-search', {
        body: { query: query.trim() },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      if (data?.results) {
        setSearchResults(data.results);
      }
    } catch (err: any) {
      setError(err?.message || 'Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, [query]);

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
            Aien, pick a song that makes your heart smile — search for it and let the music play while my love wraps around every note ♥
          </p>
        </motion.div>

        {/* Single search bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2 mb-6"
        >
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Search a song name or paste a YouTube link..."
            className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 font-body text-sm focus:outline-none focus:border-white/30 transition-colors"
          />
          <button
            onClick={handleSubmit}
            disabled={isSearching}
            className="px-6 py-3 rounded-xl bg-white/15 border border-white/15 text-white text-sm font-body hover:bg-white/25 transition-all disabled:opacity-50"
          >
            {isSearching ? '...' : '🔍'}
          </button>
        </motion.div>

        {/* Error */}
        {error && <p className="text-sm text-red-400/80 mb-4 font-body">{error}</p>}

        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="space-y-2 mb-6 max-h-[50vh] overflow-y-auto">
            {searchResults.map((r) => (
              <button
                key={r.videoId}
                onClick={() => { setCurrentVideoId(r.videoId); setSearchResults([]); setQuery(''); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left"
              >
                <img src={r.thumbnail} alt="" className="w-24 h-16 rounded-lg object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-white/90 font-body line-clamp-2">{r.title}</p>
                  <p className="text-xs text-white/40 font-body mt-0.5">{r.uploaderName}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Video / Audio toggle */}
        {currentVideoId && (
          <div className="flex items-center justify-center gap-3 mb-5">
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
        )}

        {/* Player */}
        <AnimatePresence mode="wait">
          {currentVideoId && (
            <motion.div
              key={currentVideoId + (isAudioOnly ? '-a' : '-v')}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {isAudioOnly ? (
                <>
                  {/* Completely hidden iframe — only plays audio */}
                  <iframe
                    src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&rel=0`}
                    title="Audio playback"
                    allow="autoplay; encrypted-media"
                    className="fixed"
                    style={{ width: 1, height: 1, top: -9999, left: -9999, opacity: 0, pointerEvents: 'none' }}
                  />
                  {/* Audio visualizer */}
                  <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 py-12 px-6 max-w-md mx-auto">
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
                    <p className="text-center text-white/50 font-body text-sm">♫ Playing audio...</p>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40">
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&rel=0`}
                      title="YouTube player"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!currentVideoId && searchResults.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center py-16">
            <p className="text-5xl mb-4">🎶</p>
            <p className="text-white/30 font-body text-xs">Type a song name above and hit search</p>
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
