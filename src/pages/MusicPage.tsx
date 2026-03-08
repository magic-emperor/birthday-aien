import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

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
  const [url, setUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mode, setMode] = useState<'paste' | 'search'>('paste');
  const [error, setError] = useState('');

  const handlePaste = useCallback(() => {
    setError('');
    const id = extractVideoId(url.trim());
    if (id) {
      setCurrentVideoId(id);
      setUrl('');
    } else {
      setError("Hmm, that doesn't look right. Try a link like https://youtube.com/watch?v=...");
    }
  }, [url]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setError('');
    setSearchResults([]);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('youtube-search', {
        body: { query: searchQuery },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      if (data?.results) {
        setSearchResults(data.results);
      }
    } catch (err: any) {
      setError(err?.message || 'Search failed. Try pasting a YouTube link instead.');
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  // Animated bars for audio-only mode
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
            Aien, pick a song that makes your heart smile — paste it here and let the music play while my love wraps around every note ♥
          </p>
        </motion.div>

        {/* Mode tabs */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => { setMode('paste'); setError(''); }}
            className={`px-5 py-2.5 rounded-full text-sm font-body transition-all ${
              mode === 'paste'
                ? 'bg-white/20 text-white border border-white/20'
                : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'
            }`}
          >
            🔗 Paste URL
          </button>
          <button
            onClick={() => { setMode('search'); setError(''); }}
            className={`px-5 py-2.5 rounded-full text-sm font-body transition-all ${
              mode === 'search'
                ? 'bg-white/20 text-white border border-white/20'
                : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'
            }`}
          >
            🔍 Search Song
          </button>
        </div>

        {/* Paste mode */}
        {mode === 'paste' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 mb-4">
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePaste()}
              placeholder="Paste a YouTube link here..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 font-body text-sm focus:outline-none focus:border-white/30 transition-colors"
            />
            <button onClick={handlePaste} className="px-6 py-3 rounded-xl bg-white/15 border border-white/15 text-white text-sm font-body hover:bg-white/25 transition-all">
              Play ▶
            </button>
          </motion.div>
        )}

        {/* Search mode */}
        {mode === 'search' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search for a song..."
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 font-body text-sm focus:outline-none focus:border-white/30 transition-colors"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-6 py-3 rounded-xl bg-white/15 border border-white/15 text-white text-sm font-body hover:bg-white/25 transition-all disabled:opacity-50"
              >
                {isSearching ? '...' : 'Search'}
              </button>
            </div>

            {/* Results */}
            <div className="space-y-2 mb-6 max-h-[50vh] overflow-y-auto">
              {searchResults.map((r) => (
                <button
                  key={r.videoId}
                  onClick={() => { setCurrentVideoId(r.videoId); setSearchResults([]); setSearchQuery(''); }}
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
          </motion.div>
        )}

        {/* Error */}
        {error && <p className="text-sm text-red-400/80 mb-4 font-body">{error}</p>}

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
                  {/* Hidden iframe for audio playback */}
                  <div className="absolute" style={{ width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&rel=0`}
                      title="Audio playback"
                      allow="autoplay; encrypted-media"
                      style={{ width: 300, height: 200 }}
                    />
                  </div>
                  {/* Audio visualizer UI */}
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

        {!currentVideoId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center py-16">
            <p className="text-5xl mb-4">🎶</p>
            <p className="text-white/30 font-body text-xs">Search for a song or paste a YouTube link above</p>
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
