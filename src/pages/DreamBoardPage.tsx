import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Dream {
  id: string;
  text: string;
  emoji: string;
  category: string;
  done: boolean;
  createdAt: number;
}

const CATEGORIES = [
  { label: 'Travel', emoji: '✈️' },
  { label: 'Experience', emoji: '🎭' },
  { label: 'Food', emoji: '🍕' },
  { label: 'Goal', emoji: '🎯' },
  { label: 'Adventure', emoji: '🏔️' },
  { label: 'Together', emoji: '💑' },
];

const STORAGE_KEY = 'dream-board-items';

function loadDreams(): Dream[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : getDefaultDreams();
  } catch { return getDefaultDreams(); }
}

function saveDreams(dreams: Dream[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dreams));
}

function getDefaultDreams(): Dream[] {
  return [
    { id: '1', text: 'Watch the Northern Lights together', emoji: '🌌', category: 'Travel', done: false, createdAt: Date.now() },
    { id: '2', text: 'Cook a full meal together from scratch', emoji: '👨‍🍳', category: 'Food', done: false, createdAt: Date.now() },
    { id: '3', text: 'Take a road trip with no destination', emoji: '🚗', category: 'Adventure', done: false, createdAt: Date.now() },
    { id: '4', text: 'Stargaze on a hilltop', emoji: '⭐', category: 'Together', done: false, createdAt: Date.now() },
    { id: '5', text: 'Visit Paris together', emoji: '🗼', category: 'Travel', done: false, createdAt: Date.now() },
    { id: '6', text: 'Learn to dance together', emoji: '💃', category: 'Experience', done: false, createdAt: Date.now() },
  ];
}

const DreamBoardPage: React.FC = () => {
  const navigate = useNavigate();
  const [dreams, setDreams] = useState<Dream[]>(loadDreams);
  const [showAdd, setShowAdd] = useState(false);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState('Together');
  const [newEmoji, setNewEmoji] = useState('💫');
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all');

  const update = useCallback((updated: Dream[]) => {
    setDreams(updated);
    saveDreams(updated);
  }, []);

  const toggleDone = (id: string) => {
    update(dreams.map(d => d.id === id ? { ...d, done: !d.done } : d));
  };

  const addDream = () => {
    if (!newText.trim()) return;
    const dream: Dream = {
      id: Date.now().toString(),
      text: newText.trim(),
      emoji: newEmoji,
      category: newCategory,
      done: false,
      createdAt: Date.now(),
    };
    update([dream, ...dreams]);
    setNewText('');
    setNewEmoji('💫');
    setShowAdd(false);
  };

  const deleteDream = (id: string) => {
    update(dreams.filter(d => d.id !== id));
  };

  const filtered = dreams.filter(d => {
    if (filter === 'todo') return !d.done;
    if (filter === 'done') return d.done;
    return true;
  });

  const doneCount = dreams.filter(d => d.done).length;
  const progress = dreams.length > 0 ? (doneCount / dreams.length) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[hsl(260,35%,10%)] via-[hsl(270,30%,14%)] to-[hsl(250,25%,8%)] overflow-y-auto">
      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 40 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/50"
            style={{
              width: 1 + Math.random() * 2,
              height: 1 + Math.random() * 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-sm text-white/80 hover:bg-white/20 transition-all">
          ← Back
        </button>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-16">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-display text-white/90 mb-3">✨ Our Dream Board</h1>
          <p className="text-white/40 font-body text-sm italic max-w-sm mx-auto">
            Every dream we share brings us closer — let's make them all come true, one by one ♥
          </p>
        </motion.div>

        {/* Progress */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-8 max-w-md mx-auto">
          <div className="flex justify-between text-xs text-white/40 font-body mb-2">
            <span>{doneCount} of {dreams.length} dreams fulfilled</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[hsl(310,45%,55%)] to-[hsl(330,60%,65%)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Filter + Add */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {(['all', 'todo', 'done'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-body transition-all ${
                  filter === f ? 'bg-white/20 text-white border border-white/20' : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'
                }`}
              >
                {f === 'all' ? '✦ All' : f === 'todo' ? '🌙 Dreams' : '✅ Done'}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm text-white/80 hover:bg-white/20 transition-all font-body"
          >
            {showAdd ? '✕ Close' : '+ Add Dream'}
          </button>
        </div>

        {/* Add form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-4">
                <input
                  value={newText}
                  onChange={e => setNewText(e.target.value)}
                  placeholder="What's your dream? ✨"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 text-sm font-body placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-all"
                  onKeyDown={e => e.key === 'Enter' && addDream()}
                />
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.label}
                      onClick={() => { setNewCategory(c.label); setNewEmoji(c.emoji); }}
                      className={`px-3 py-1.5 rounded-full text-xs font-body transition-all ${
                        newCategory === c.label ? 'bg-white/20 text-white border border-white/20' : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'
                      }`}
                    >
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
                <button onClick={addDream} className="w-full py-3 rounded-xl bg-gradient-to-r from-[hsl(310,45%,55%)] to-[hsl(330,60%,65%)] text-white text-sm font-body font-medium hover:opacity-90 transition-all">
                  Add to our dreams ♥
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dream cards */}
        <div className="grid gap-3">
          <AnimatePresence>
            {filtered.map((dream, i) => (
              <motion.div
                key={dream.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`group flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  dream.done
                    ? 'bg-white/5 border-white/5 opacity-60'
                    : 'bg-white/8 border-white/10 hover:bg-white/12 hover:border-white/15'
                }`}
              >
                <button
                  onClick={() => toggleDone(dream.id)}
                  className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                    dream.done ? 'border-white/30 bg-white/15 text-white/80' : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  {dream.done && <span className="text-xs">✓</span>}
                </button>
                <span className="text-xl flex-shrink-0">{dream.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-body ${dream.done ? 'line-through text-white/40' : 'text-white/80'}`}>
                    {dream.text}
                  </p>
                  <p className="text-xs text-white/25 font-body mt-0.5">{dream.category}</p>
                </div>
                <button
                  onClick={() => deleteDream(dream.id)}
                  className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-white/50 text-xs transition-all"
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">{filter === 'done' ? '🌟' : '🌙'}</p>
            <p className="text-white/30 font-body text-sm">
              {filter === 'done' ? 'No dreams fulfilled yet — but soon!' : 'All dreams fulfilled! Time to dream bigger ✨'}
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

export default DreamBoardPage;
