import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, ListMusic, X, Play, Pause, SkipForward, SkipBack, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { title } from 'process';

// TODO: ADD YOUR 20-30 YOUTUBE LINKS HERE!
export const playlistUrls = [
  { title: "See you again Aien", url: "https://youtu.be/RgKAFK5djSk" },
  { title: "Romantic Mix", url: "https://www.youtube.com/watch?v=kJQP7kiw5Fk" },
  { title: "Perfect My girl", url: "https://youtu.be/2Vv-BfVoq4g" },
  { title: "I Found Love", url: "https://youtu.be/1FVF-9KQiPo" },
  { title: "Arabic Love", url: "https://youtu.be/QqJ9zrY_ITw" },
  { title: "Love you thousand Years", url: "https://youtu.be/bjjC1-G6Fxo" },
  { title: "They call this Love", url: "https://youtu.be/e1mOmdykmwI" },
  { title: "Love in shape of you", url: "https://youtu.be/U6QsJO4rnrY" },
  { title: "I wanna be next to you", url: "https://youtu.be/kPa7bsKwL-c" },
  { title: "Until I found you", url: "https://youtu.be/GxldQ9eX2wo" },
  { title: "O ladki hai kaha", url: "https://youtu.be/IIg8H60bRJo" },
  { title: "Agar mai kahu", url: "https://youtu.be/30tnmyzgRSI" },
  { title: "Dil tere liye bekarar", url: "https://youtu.be/AMU_v2badYY" },
  { title: "O Hamdam", url: "https://youtu.be/HapoNY-5K9g" },
  { title: "Pehle bhi mai", url: "https://youtu.be/iAIBF2ngbWY" },
  { title: "Kaisa mujhe", url: "https://youtu.be/uC1iJcYOyeY" },
  { title: "Surili akhiyo", url: "https://youtu.be/HqjPEwhiWcE" },
  { title: "Pehli nazar me", url: "https://youtu.be/qdLYbA9Mu_M" },
  { title: "Hona tha pyar", url: "https://youtu.be/ZGw4akYqcVw" },
  { title: "Sawaarloo", url: "https://youtu.be/6k8Aja80GQM" },
  { title: "Ek din", url: "https://youtu.be/4FC_WJjIsmk" },
  { title: "Agar tum sath ho", url: "https://youtu.be/fQlhzY5UH6s" },
  { title: "Labon ko  ", url: "https://youtu.be/-FP2Cmc7zj4" },
];

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

function extractYoutubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
  return match ? match[1] : null;
}

const BackgroundMusic: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  const playerRef = useRef<any>(null);
  const currentSong = playlistUrls[currentIndex];
  const ytId = currentSong ? extractYoutubeId(currentSong.url) : null;

  // Next song auto-advance feature
  const advanceToNext = useRef(() => { });
  advanceToNext.current = () => {
    setCurrentIndex((prev) => (prev + 1) % playlistUrls.length);
  };

  useEffect(() => {
    // Load YouTube API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;

      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
      document.body.appendChild(tag);
    } else if (window.YT.Player && !playerRef.current) {
      initPlayer();
    }

    function initPlayer() {
      if (!ytId) return;
      playerRef.current = new window.YT.Player('yt-hidden-player', {
        height: '0',
        width: '0',
        videoId: ytId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
        },
        events: {
          onReady: (event: any) => {
            if (hasInteracted && isPlaying) {
              event.target.playVideo();
            }
          },
          onStateChange: (event: any) => {
            // YT.PlayerState.ENDED == 0
            if (event.data === 0) {
              advanceToNext.current();
            }
            if (event.data === 1) setIsPlaying(true);  // Playing
            if (event.data === 2) setIsPlaying(false); // Paused
          }
        }
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []); // Initialize once

  // Handle changing songs
  useEffect(() => {
    if (playerRef.current && playerRef.current.loadVideoById && ytId) {
      if (hasInteracted) {
        playerRef.current.loadVideoById(ytId);
        if (isPlaying) {
          playerRef.current.playVideo();
        }
      }
    }
  }, [currentIndex, ytId, hasInteracted]);

  const togglePlay = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      setIsPlaying(true);
      if (playerRef.current?.playVideo) playerRef.current.playVideo();
      return;
    }

    if (isPlaying) {
      playerRef.current?.pauseVideo();
    } else {
      playerRef.current?.playVideo();
    }
  };

  const playSong = (index: number) => {
    setCurrentIndex(index);
    if (!hasInteracted) setHasInteracted(true);
    setIsPlaying(true);
  };

  // Auto-play on first click anywhere
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        setIsPlaying(true);
        if (playerRef.current?.playVideo) {
          playerRef.current.playVideo();
        }
      }
    };

    document.addEventListener('click', handleFirstInteraction, { once: true });
    return () => document.removeEventListener('click', handleFirstInteraction);
  }, [hasInteracted]);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Hidden YouTube container */}
      <div id="yt-hidden-player" className="absolute opacity-0 pointer-events-none w-0 h-0" />

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-3 bg-card/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-xl w-64 overflow-hidden flex flex-col"
          >
            <div className="p-3 border-b border-primary/10 flex justify-between items-center bg-primary/5">
              <div className="flex items-center gap-2 text-primary font-display text-sm">
                <Music className="w-4 h-4" />
                <span className="font-semibold">Songs for My Love (Aien)</span>
              </div>
              <button onClick={() => setIsExpanded(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 
                height of exactly 5 items without scrolling. 
                Each item is 40px (py-2.5 = 20px, text = 20px). 
                40 * 5 = 200px max height.
             */}
            <div className="max-h-[200px] overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-primary/20">
              {playlistUrls.map((song, idx) => (
                <button
                  key={idx}
                  onClick={() => playSong(idx)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-body mb-0.5 flex items-center gap-3 transition-colors ${currentIndex === idx
                    ? 'bg-primary/20 text-primary font-medium'
                    : 'hover:bg-primary/10 text-foreground/80'
                    }`}
                >
                  {currentIndex === idx && isPlaying ? (
                    <Volume2 className="w-3.5 h-3.5 flex-shrink-0" />
                  ) : (
                    <span className="w-3.5 flex-shrink-0 text-center text-[10px] opacity-40">{idx + 1}</span>
                  )}
                  <span className="truncate">{song.title}</span>
                </button>
              ))}
            </div>

            <div className="p-2 border-t border-primary/10 flex items-center justify-between bg-primary/5">
              <div className="flex-1 truncate text-xs font-body text-primary mr-2 flex flex-col">
                <span className="opacity-70 text-[10px]">Playing</span>
                <span className="font-medium truncate">{currentSong?.title}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => playSong((currentIndex - 1 + playlistUrls.length) % playlistUrls.length)} className="p-1 hover:bg-primary/20 rounded-full text-primary">
                  <SkipBack className="w-3.5 h-3.5" />
                </button>
                <button onClick={togglePlay} className="p-1.5 bg-primary text-primary-foreground hover:bg-primary/80 rounded-full shadow-md">
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => advanceToNext.current()} className="p-1 hover:bg-primary/20 rounded-full text-primary">
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <div className="flex items-center gap-2">
        <AnimatePresence>
          {!isExpanded && currentSong && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-primary/20 text-xs text-primary font-body max-w-[140px] shadow-lg truncate cursor-pointer hover:bg-background/90"
              onClick={() => setIsExpanded(true)}
            >
              {isPlaying ? "🎵 " : "⏸ "}{currentSong.title}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${isExpanded ? 'bg-card text-primary border border-primary/20' : 'bg-primary text-primary-foreground'
            }`}
        >
          {isExpanded ? (
            <X className="w-5 h-5" />
          ) : isPlaying ? (
            <div className="relative flex items-center justify-center">
              <Volume2 className="w-5 h-5 drop-shadow-md z-10" />
            </div>
          ) : (
            <ListMusic className="w-5 h-5" />
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default BackgroundMusic;
