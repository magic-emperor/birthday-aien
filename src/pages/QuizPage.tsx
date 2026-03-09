import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Sparkles, Trophy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import FallingPetals from '@/components/FallingPetals';

interface Question {
  id: number;
  question: string;
  options: { text: string; points: number; emoji: string }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "What's my favorite way to spend a lazy Sunday?",
    options: [
      { text: "Lazying out on bed all day", emoji: "🛏️", points: 3 },
      { text: "Coding a cool new project", emoji: "💻", points: 3 },
      { text: "Going out exploring somewhere", emoji: "🏔️", points: 2 },
      { text: "Learning something new", emoji: "📚", points: 2 },
    ],
  },
  {
    id: 2,
    question: "What makes me smile the most?",
    options: [
      { text: "Your surprise hugs from behind", emoji: "🤗", points: 3 },
      { text: "When you laugh at my jokes", emoji: "😂", points: 2 },
      { text: "Food. Always food.", emoji: "🍕", points: 1 },
      { text: "When you remember small details", emoji: "💝", points: 3 },
    ],
  },
  {
    id: 3,
    question: "What's my love language?",
    options: [
      { text: "Words of affirmation", emoji: "💬", points: 2 },
      { text: "Quality time", emoji: "⏰", points: 3 },
      { text: "Physical touch", emoji: "🤝", points: 3 },
      { text: "Acts of service", emoji: "💪", points: 2 },
    ],
  },
  {
    id: 4,
    question: "What do I love most about our relationship?",
    options: [
      { text: "How we can be silly together", emoji: "🤪", points: 3 },
      { text: "The deep conversations at 2am", emoji: "🌙", points: 3 },
      { text: "Our adventure spirit", emoji: "✈️", points: 2 },
      { text: "The comfort of being ourselves", emoji: "🏠", points: 3 },
    ],
  },
  {
    id: 5,
    question: "What's my biggest dream for us?",
    options: [
      { text: "Traveling the world together", emoji: "🌍", points: 3 },
      { text: "Building a cozy home", emoji: "🏡", points: 3 },
      { text: "Growing old and still being in love", emoji: "👴👵", points: 3 },
      { text: "All of the above", emoji: "✨", points: 3 },
    ],
  },
  {
    id: 6,
    question: "What's the best gift you could give me?",
    options: [
      { text: "Something handmade with love", emoji: "🎨", points: 3 },
      { text: "A surprise trip somewhere", emoji: "🎫", points: 3 },
      { text: "Your time and attention", emoji: "💕", points: 3 },
      { text: "Something expensive and fancy", emoji: "💎", points: 1 },
    ],
  },
  {
    id: 7,
    question: "What do I think about before falling asleep?",
    options: [
      { text: "Our future together", emoji: "🔮", points: 3 },
      { text: "The day's best moments with you", emoji: "☀️", points: 3 },
      { text: "Random memes I saw", emoji: "😂", points: 1 },
      { text: "Whether you're thinking of me too", emoji: "💭", points: 3 },
    ],
  },
  {
    id: 8,
    question: "What would be my perfect date?",
    options: [
      { text: "Stargazing on a quiet hill", emoji: "⭐", points: 3 },
      { text: "A cozy movie night at home", emoji: "🎬", points: 3 },
      { text: "Exploring a new city together", emoji: "🗺️", points: 3 },
      { text: "A fancy dinner at a restaurant", emoji: "🍽️", points: 2 },
    ],
  },
  {
    id: 9,
    question: "What song reminds me of you?",
    options: [
      { text: "Something romantic and slow", emoji: "🎵", points: 2 },
      { text: "Our special song we both love", emoji: "💑", points: 3 },
      { text: "A fun, upbeat song we dance to", emoji: "💃", points: 3 },
      { text: "Any song, because everything reminds me of you", emoji: "🎶", points: 3 },
    ],
  },
  {
    id: 10,
    question: "What's my favorite thing about YOUR smile?",
    options: [
      { text: "How it lights up your whole face", emoji: "✨", points: 3 },
      { text: "The little crinkles by your eyes", emoji: "👀", points: 3 },
      { text: "How contagious it is", emoji: "😊", points: 3 },
      { text: "Everything — it's just perfect", emoji: "💯", points: 3 },
    ],
  },
];

const results = [
  {
    minScore: 0,
    maxScore: 15,
    title: "Still Learning! 📚",
    message: "Looks like there's more to discover about me! But that's the beautiful part — we have a lifetime of getting to know each other.",
    emoji: "🌱",
  },
  {
    minScore: 16,
    maxScore: 22,
    title: "On the Right Track! 💫",
    message: "You know me pretty well! Some answers surprised me, but that just means we have more beautiful conversations ahead.",
    emoji: "🌟",
  },
  {
    minScore: 23,
    maxScore: 27,
    title: "You Really Get Me! 💕",
    message: "Wow! You know so much about what makes me tick. This is why being with you feels like home.",
    emoji: "🏠",
  },
  {
    minScore: 28,
    maxScore: 30,
    title: "Soulmate Status! 👑",
    message: "You know me better than I know myself! We're definitely two halves of the same heart, Aien & Mehnaz forever.",
    emoji: "💑",
  },
];

const QuizPage: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);

  const handleAnswer = (points: number, index: number) => {
    setSelectedAnswer(index);
    setAnswers([...answers, index]);
    
    setTimeout(() => {
      setScore(score + points);
      setSelectedAnswer(null);
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setShowResult(true);
      }
    }, 800);
  };

  const getResult = () => {
    return results.find(r => score >= r.minScore && score <= r.maxScore) || results[0];
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setAnswers([]);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FallingPetals />
      
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 pointer-events-none" />

      {/* Back button */}
      <a
        href="/"
        className="fixed top-6 left-6 z-50 w-12 h-12 rounded-full bg-background/40 backdrop-blur-md border border-primary/20 flex items-center justify-center hover:bg-background/60 transition-all duration-300 shadow-lg"
      >
        <ArrowLeft className="w-5 h-5 text-foreground" />
      </a>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Heart className="w-6 h-6 text-primary fill-primary/20" />
                  <h1 className="text-2xl md:text-4xl font-display text-gradient-sunset">
                    How Well Do You Know Me?
                  </h1>
                  <Heart className="w-6 h-6 text-primary fill-primary/20" />
                </div>
                <p className="text-muted-foreground font-body text-sm">
                  Let's see if you're really my soulmate 😏
                </p>
              </div>

              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-muted-foreground mb-2 font-body">
                  <span>Question {currentQuestion + 1} of {questions.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Question card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="bg-card/60 backdrop-blur-xl rounded-3xl border border-primary/20 p-8 shadow-2xl"
                >
                  <h2 className="text-xl md:text-2xl font-body text-center mb-8 text-foreground">
                    {questions[currentQuestion].question}
                  </h2>

                  <div className="grid gap-3">
                    {questions[currentQuestion].options.map((option, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleAnswer(option.points, index)}
                        disabled={selectedAnswer !== null}
                        whileHover={{ scale: selectedAnswer === null ? 1.02 : 1 }}
                        whileTap={{ scale: selectedAnswer === null ? 0.98 : 1 }}
                        className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                          selectedAnswer === index
                            ? 'bg-primary/20 border-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)]'
                            : 'bg-background/40 border-primary/10 hover:border-primary/30 hover:bg-background/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{option.emoji}</span>
                          <span className="font-body text-foreground/90">{option.text}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="w-full max-w-lg text-center"
            >
              {/* Result card */}
              <div className="bg-card/60 backdrop-blur-xl rounded-3xl border border-primary/20 p-8 shadow-2xl">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10, delay: 0.2 }}
                  className="mb-6"
                >
                  <span className="text-8xl">{getResult().emoji}</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Trophy className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl md:text-3xl font-display text-gradient-sunset">
                      {getResult().title}
                    </h2>
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>

                  <p className="text-lg font-body text-foreground/80 mb-6">
                    {getResult().message}
                  </p>

                  <div className="bg-primary/10 rounded-xl p-4 mb-6">
                    <p className="text-sm text-muted-foreground font-body">Your Score</p>
                    <p className="text-4xl font-display text-primary">
                      {score} <span className="text-lg text-muted-foreground">/ 30</span>
                    </p>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={resetQuiz}
                      variant="outline"
                      className="gap-2 rounded-full"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </Button>
                    <Button asChild className="gap-2 rounded-full">
                      <a href="/">
                        <Heart className="w-4 h-4" />
                        Back Home
                      </a>
                    </Button>
                  </div>
                </motion.div>
              </div>

              {/* Floating sparkles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: Math.random() * 400 - 200,
                      y: Math.random() * 400 - 200,
                    }}
                    transition={{
                      duration: 2,
                      delay: 0.5 + i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                    className="absolute left-1/2 top-1/2"
                  >
                    <Sparkles className="w-4 h-4 text-primary" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuizPage;
