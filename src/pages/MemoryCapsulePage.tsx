import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface Capsule {
  id: string;
  title: string;
  message: string;
  emoji: string;
  unlock_date: string;
  created_at: string;
}

function isUnlocked(unlockDate: string): boolean {
  return new Date() >= new Date(unlockDate);
}

function daysUntil(unlockDate: string): number {
  const diff = new Date(unlockDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const EMOJIS = ['💌', '🎂', '💕', '🌟', '🎁', '🌙', '✨', '🦋'];

const MemoryCapsulePage: React.FC = () => {
  const navigate = useNavigate();
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [openCapsuleId, setOpenCapsuleId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newEmoji, setNewEmoji] = useState('💌');

  const fetchCapsules = async () => {
    const { data } = await supabase
      .from('memory_capsules')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setCapsules(data as Capsule[]);
    setLoading(false);
  };

  useEffect(() => { fetchCapsules(); }, []);

  const createCapsule = async () => {
    if (!newTitle.trim() || !newMessage.trim() || !newDate) return;
    await supabase.from('memory_capsules').insert({
      title: newTitle.trim(),
      message: newMessage.trim(),
      emoji: newEmoji,
      unlock_date: new Date(newDate).toISOString(),
    });
    setNewTitle('');
    setNewMessage('');
    setNewDate('');
    setNewEmoji('💌');
    setShowCreate(false);
    fetchCapsules();
  };

  const deleteCapsule = async (id: string) => {
    await supabase.from('memory_capsules').delete().eq('id', id);
    setCapsules(prev => prev.filter(c => c.id !== id));
  };

  const openCapsule = capsules.find(c => c.id === openCapsuleId);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[hsl(240,30%,10%)] via-[hsl(250,25%,14%)] to-[hsl(235,30%,8%)] overflow-y-auto">
      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 50 }, (_, i) => (
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-display text-white/90 mb-3">💌 Memory Capsule</h1>
          <p className="text-white/40 font-body text-sm italic max-w-sm mx-auto">
            Seal your feelings in time — write letters that unlock on special dates ♥
          </p>
        </motion.div>

        {/* Create button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-[hsl(310,45%,55%)] to-[hsl(330,60%,65%)] text-white text-sm font-body font-medium hover:opacity-90 transition-all shadow-lg shadow-[hsl(310,45%,55%)/0.3]"
          >
            {showCreate ? '✕ Cancel' : '✉️ Write a New Letter'}
          </button>
        </div>

        {/* Create form */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8"
            >
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {EMOJIS.map(e => (
                    <button
                      key={e}
                      onClick={() => setNewEmoji(e)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                        newEmoji === e ? 'bg-white/20 border border-white/30 scale-110' : 'bg-white/5 border border-white/5 hover:bg-white/10'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Letter title (e.g. 'For Our Anniversary')"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 text-sm font-body placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-all"
                />
                <textarea
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Pour your heart out... this letter will be sealed until the unlock date ♥"
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 text-sm font-body placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-all resize-none"
                />
                <div>
                  <label className="text-xs text-white/40 font-body mb-1 block">Unlock on this date:</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 text-sm font-body focus:outline-none focus:border-white/25 transition-all"
                  />
                </div>
                <button
                  onClick={createCapsule}
                  disabled={!newTitle.trim() || !newMessage.trim() || !newDate}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[hsl(310,45%,55%)] to-[hsl(330,60%,65%)] text-white text-sm font-body font-medium hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Seal This Letter 🔒
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Capsule list */}
        {loading ? (
          <div className="text-center py-16">
            <p className="text-white/30 font-body text-sm">Loading capsules...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {capsules.map((capsule, i) => {
              const unlocked = isUnlocked(capsule.unlock_date);
              const days = daysUntil(capsule.unlock_date);

              return (
                <motion.div
                  key={capsule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`group relative p-5 rounded-2xl border transition-all cursor-pointer ${
                    unlocked
                      ? 'bg-white/8 border-white/15 hover:bg-white/12'
                      : 'bg-white/4 border-white/8'
                  }`}
                  onClick={() => unlocked && setOpenCapsuleId(capsule.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`text-3xl ${unlocked ? '' : 'grayscale opacity-50'}`}>
                      {capsule.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-body font-medium ${unlocked ? 'text-white/90' : 'text-white/50'}`}>
                        {capsule.title}
                      </p>
                      {unlocked ? (
                        <p className="text-xs text-white/30 font-body mt-1">
                          🔓 Unlocked — tap to read • Written {format(new Date(capsule.created_at), 'MMM d, yyyy')}
                        </p>
                      ) : (
                        <div className="mt-2">
                          <p className="text-xs text-white/30 font-body">
                            🔒 Sealed until {format(new Date(capsule.unlock_date), 'MMMM d, yyyy')}
                          </p>
                          <p className="text-xs text-white/20 font-body mt-0.5">
                            {days} day{days !== 1 ? 's' : ''} remaining...
                          </p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteCapsule(capsule.id); }}
                      className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-white/50 text-xs transition-all"
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && capsules.length === 0 && (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">💌</p>
            <p className="text-white/30 font-body text-sm">No capsules yet — write your first letter!</p>
          </div>
        )}
      </div>

      {/* Read capsule modal */}
      <AnimatePresence>
        {openCapsule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpenCapsuleId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gradient-to-b from-[hsl(260,30%,18%)] to-[hsl(250,25%,12%)] border border-white/15 rounded-2xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <span className="text-5xl block mb-3">{openCapsule.emoji}</span>
                <h2 className="text-xl font-display text-white/90">{openCapsule.title}</h2>
                <p className="text-xs text-white/30 font-body mt-2">
                  Written on {format(new Date(openCapsule.created_at), 'MMMM d, yyyy')}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <p className="text-sm text-white/80 font-body leading-relaxed whitespace-pre-wrap">
                  {openCapsule.message}
                </p>
              </div>
              <button
                onClick={() => setOpenCapsuleId(null)}
                className="w-full mt-6 py-3 rounded-xl bg-white/10 border border-white/10 text-white/60 text-sm font-body hover:bg-white/15 transition-all"
              >
                Close ♥
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default MemoryCapsulePage;
