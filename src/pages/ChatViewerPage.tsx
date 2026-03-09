import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ChatMessage {
  sender: string;
  content: string;
  date: string;
  timestamp: number;
  imageUrl?: string;
}

const parseInstagramHtml = (html: string): ChatMessage[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const messages: ChatMessage[] = [];

  const messageBlocks = doc.querySelectorAll('div.pam._3-95._2ph-._a6-g');

  messageBlocks.forEach((block) => {
    const senderEl = block.querySelector('h2._a6-h');
    const contentEl = block.querySelector('div._a6-p');
    const dateEl = block.querySelector('div._a6-o');
    const imgEl = block.querySelector('img');

    if (senderEl) {
      const sender = senderEl.textContent?.trim() || 'Unknown';
      const rawContent = contentEl?.textContent?.trim() || '';
      const content = rawContent.replace(/\s+/g, ' ').trim();
      const dateStr = dateEl?.textContent?.trim() || '';
      const timestamp = dateStr ? new Date(dateStr).getTime() : 0;
      const imageUrl = imgEl?.getAttribute('src') || undefined;

      if ((content && !content.startsWith('Reacted ')) || imageUrl) {
        messages.push({ sender, content, date: dateStr, timestamp, imageUrl });
      }
    }
  });

  return messages;
};

// Helper to make URLs clickable
const renderContentWithLinks = (content: string) => {
  if (!content) return null;
  
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  
  return parts.map((part, index) => {
    if (part.match(/^https?:\/\//)) {
      const isReel = part.includes('instagram.com/reel');
      const isInsta = part.includes('instagram.com');
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:text-purple-300 underline break-all inline-block"
        >
          {isReel ? '🎬 Instagram Reel' : isInsta ? '📸 Instagram Link' : part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

const MESSAGES_PER_PAGE = 50;

const ChatViewerPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [senderFilter, setSenderFilter] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(MESSAGES_PER_PAGE);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const loaderRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const allMessages: ChatMessage[] = [];
    let processed = 0;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const html = ev.target?.result as string;
        const parsed = parseInstagramHtml(html);
        allMessages.push(...parsed);
        processed++;

        if (processed === files.length) {
          allMessages.sort((a, b) => a.timestamp - b.timestamp);
          setMessages(prev => {
            const combined = [...prev, ...allMessages];
            const unique = combined.filter((msg, idx, arr) => 
              arr.findIndex(m => m.content === msg.content && m.timestamp === msg.timestamp) === idx
            );
            unique.sort((a, b) => a.timestamp - b.timestamp);
            return unique;
          });
          setIsLoaded(true);
          setFileName(prev => prev ? `${prev} + ${files.length} file(s)` : (files.length === 1 ? files[0].name : `${files.length} files`));
        }
      };
      reader.readAsText(file);
    });
  }, []);

  const senders = useMemo(() => {
    const set = new Set(messages.map(m => m.sender));
    return Array.from(set);
  }, [messages]);

  const filteredMessages = useMemo(() => {
    let filtered = messages;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(m =>
        m.content.toLowerCase().includes(lower) ||
        m.sender.toLowerCase().includes(lower) ||
        m.date.toLowerCase().includes(lower)
      );
    }
    if (senderFilter !== 'all') {
      filtered = filtered.filter(m => m.sender === senderFilter);
    }
    if (dateRange.from) {
      filtered = filtered.filter(m => m.timestamp >= dateRange.from!.getTime());
    }
    if (dateRange.to) {
      const endOfDay = new Date(dateRange.to);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(m => m.timestamp <= endOfDay.getTime());
    }
    return filtered;
  }, [messages, searchTerm, senderFilter, dateRange]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredMessages.length) {
          setVisibleCount(prev => Math.min(prev + MESSAGES_PER_PAGE, filteredMessages.length));
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [visibleCount, filteredMessages.length]);

  useEffect(() => {
    setVisibleCount(MESSAGES_PER_PAGE);
  }, [searchTerm, senderFilter, dateRange]);

  const visibleMessages = useMemo(() => {
    return filteredMessages.slice(0, visibleCount);
  }, [filteredMessages, visibleCount]);

  const clearDateRange = () => setDateRange({ from: undefined, to: undefined });

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[hsl(270,30%,8%)] via-[hsl(265,25%,12%)] to-[hsl(260,20%,6%)] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm text-white/80 hover:bg-white/20 transition-all"
          >
            ← Back
          </button>
          <h1 className="text-lg font-display text-white/90">💬 Our Conversations</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-12">
        {!isLoaded ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <p className="text-5xl mb-6">💌</p>
            <h2 className="text-2xl font-display text-white/90 mb-3">Relive Our Moments</h2>
            <p className="text-white/40 font-body text-sm mb-4 max-w-sm mx-auto">
              Upload your Instagram chat HTML files and scroll through every memory ♥
            </p>
            <div className="text-left max-w-sm mx-auto mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-white/60 font-body text-xs font-medium mb-2">📁 How to get your chat files:</p>
              <ol className="text-white/40 font-body text-xs space-y-1.5 list-decimal list-inside">
                <li>Go to Instagram → Settings → Your Activity</li>
                <li>Download Your Information → Messages</li>
                <li>Choose <span className="text-white/60">HTML</span> format & download</li>
                <li>Upload files like <code className="text-white/50 bg-white/10 px-1 rounded">message_1.html</code></li>
              </ol>
            </div>
            <label className="inline-block cursor-pointer">
              <div className="px-8 py-4 rounded-2xl bg-white/10 border-2 border-dashed border-white/20 hover:bg-white/15 hover:border-white/30 transition-all">
                <p className="text-white/80 font-body text-sm mb-1">📂 Drop HTML files here or click to upload</p>
                <p className="text-white/30 font-body text-xs">Supports multiple files (message_1.html, message_2.html, ...)</p>
              </div>
              <input
                type="file"
                accept=".html,.htm"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </motion.div>
        ) : (
          <div className="py-6">
            {/* Stats */}
            <div className="text-center mb-6">
              <p className="text-white/40 font-body text-xs">
                💬 {messages.length} messages loaded from {fileName}
              </p>
              {senders.length === 2 && (
                <p className="text-white/50 font-body text-sm mt-2">
                  {senders[0]} 💕 {senders[1]}
                </p>
              )}
            </div>

            {/* Search & filter bar */}
            <div className="sticky top-[72px] z-10 bg-black/60 backdrop-blur-xl rounded-xl p-3 mb-6 space-y-3">
              <div className="flex gap-2 flex-wrap">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search messages, dates..."
                  className="flex-1 min-w-[200px] px-4 py-2.5 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/30 font-body text-sm focus:outline-none focus:border-white/30"
                />
                <Select value={senderFilter} onValueChange={setSenderFilter}>
                  <SelectTrigger className="w-[150px] h-[42px] bg-white/10 border-white/10 text-white/80 font-body focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="All senders" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/10 text-white/80 font-body backdrop-blur-xl">
                    <SelectItem value="all" className="focus:bg-white/10 focus:text-white">All senders</SelectItem>
                    {senders.map(s => (
                      <SelectItem key={s} value={s} className="focus:bg-white/10 focus:text-white">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Picker */}
              <div className="flex gap-2 flex-wrap items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-[42px] justify-start text-left font-body bg-white/10 border-white/10 text-white/80 hover:bg-white/15 hover:text-white",
                        !dateRange.from && "text-white/40"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? format(dateRange.from, "MMM d, yyyy") : "From date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-black/95 border-white/10 backdrop-blur-xl" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto text-white")}
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-[42px] justify-start text-left font-body bg-white/10 border-white/10 text-white/80 hover:bg-white/15 hover:text-white",
                        !dateRange.to && "text-white/40"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? format(dateRange.to, "MMM d, yyyy") : "To date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-black/95 border-white/10 backdrop-blur-xl" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto text-white")}
                    />
                  </PopoverContent>
                </Popover>

                {(dateRange.from || dateRange.to) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearDateRange}
                    className="h-[42px] w-[42px] text-white/50 hover:text-white hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <label className="cursor-pointer block">
                <span className="text-white/30 text-xs font-body hover:text-white/50 transition-all">
                  + Upload more files
                </span>
                <input
                  type="file"
                  accept=".html,.htm"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Results count */}
            {(searchTerm || dateRange.from || dateRange.to) && (
              <p className="text-white/30 font-body text-xs mb-4">
                {filteredMessages.length} messages found
                {searchTerm && ` for "${searchTerm}"`}
                {dateRange.from && ` from ${format(dateRange.from, "MMM d")}`}
                {dateRange.to && ` to ${format(dateRange.to, "MMM d")}`}
              </p>
            )}

            {/* Messages */}
            <div className="space-y-1">
              {visibleMessages.map((msg, i) => {
                const isFirst = senders[0] === msg.sender;
                return (
                  <motion.div
                    key={`${msg.timestamp}-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.002, 0.1) }}
                    className={`flex ${isFirst ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                        isFirst
                          ? 'bg-white/8 border border-white/5 rounded-bl-md'
                          : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/10 rounded-br-md'
                      }`}
                    >
                      <p className="text-xs text-white/40 font-body mb-1">{msg.sender}</p>
                      {msg.imageUrl && (
                        <img 
                          src={msg.imageUrl} 
                          alt="Shared image" 
                          className="max-w-full rounded-lg mb-2 max-h-64 object-contain"
                        />
                      )}
                      {msg.content && (
                        <p className="text-sm text-white/85 font-body leading-relaxed break-words">
                          {renderContentWithLinks(msg.content)}
                        </p>
                      )}
                      {msg.date && (
                        <p className="text-[10px] text-white/25 font-body mt-1.5 text-right">{msg.date}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Lazy load trigger */}
            {visibleCount < filteredMessages.length && (
              <div ref={loaderRef} className="text-center py-8">
                <p className="text-white/30 font-body text-sm">Loading more messages...</p>
                <p className="text-white/20 font-body text-xs mt-1">
                  Showing {visibleCount} of {filteredMessages.length}
                </p>
              </div>
            )}

            {filteredMessages.length === 0 && (
              <div className="text-center py-16">
                <p className="text-3xl mb-3">🔍</p>
                <p className="text-white/30 font-body text-sm">No messages found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatViewerPage;
