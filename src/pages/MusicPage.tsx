import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const YOUTUBE_API_KEY = ''; // Add your YouTube Data API v3 key here for search

interface SearchResult {
  videoId: string;
  title: string;
  thumbnail: string;
  channel: string;
}

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
  const [searchQuery, setSearchQuery] = useState('');
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
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
      setError('Invalid YouTube URL. Try pasting a link like https://youtube.com/watch?v=...');
    }
  }, [url]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    if (!YOUTUBE_API_KEY) {
      setError('YouTube API key not configured. Use the paste URL tab instead, or add a YouTube Data API v3 key in MusicPage.tsx');
      return;
    }
    setIsSearching(true);
    setError('');
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=8&q=${encodeURIComponent(searchQuery)}&key=${YOUTUBE_API_KEY}`
      );
      const data = await res.json();
      if (data.items) {
        setSearchResults(
          data.items.map((item: any) => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.medium.url,
            channel: item.snippet.channelTitle,
          }))
        );
      } else {
        setError(data.error?.message || 'Search failed');
      }
    } catch {
      setError('Failed to search. Check your connection.');
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

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
        <h1 className="text-xl md:text-2xl font-display text-white/90">🎵 Music Corner</h1>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 pb-12">
        {/* Mode toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setMode('paste'); setError(''); }}
            className={`px-5 py-2.5 rounded-full text-sm font-body transition-all ${
              mode === 'paste'
                ? 'bg-white/20 text-white border border-white/20'
                : 'bg-white/5 text-white/50 border border-white/5 hover:bg-white/10'
            }`}
          >
            🔗 Paste URL
          </button>
          <button
            onClick={() => { setMode('search'); setError(''); }}
            className={`px-5 py-2.5 rounded-full text-sm font-body transition-all ${
              mode === 'search'
                ? 'bg-white/20 text-white border border-white/20'
                : 'bg-white/5 text-white/50 border border-white/5 hover:bg-white/10'
            }`}
          >
            🔍 Search
          </button>
        </div>

        {/* Paste mode */}
        {mode === 'paste' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
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
              Play
            </button>
          </motion.div>
        )}

        {/* Search mode */}
        {mode === 'search' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
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

            {/* Search results */}
            <div className="space-y-2 mb-6">
              {searchResults.map((r) => (
                <button
                  key={r.videoId}
                  onClick={() => { setCurrentVideoId(r.videoId); setSearchResults([]); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left"
                >
                  <img src={r.thumbnail} alt="" className="w-24 h-16 rounded-lg object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-white/90 font-body truncate" dangerouslySetInnerHTML={{ __html: r.title }} />
                    <p className="text-xs text-white/40 font-body">{r.channel}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

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
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🎶</p>
            <p className="text-white/40 font-body text-sm">
              Paste a YouTube link or search for your favorite song
            </p>
          </div>
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
