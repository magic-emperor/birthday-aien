import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StoryNode {
  id: string;
  question: string;
  subtitle?: string;
  options: {
    label: string;
    emoji: string;
    nextId: string;
  }[];
}

interface Ending {
  id: string;
  title: string;
  message: string;
  emoji: string;
  gift: string;
}

const storyNodes: StoryNode[] = [
  {
    id: "start",
    question: "Aien, if you could go anywhere right now, where would your heart take you?",
    subtitle: "Choose your dream destination...",
    options: [
      { label: "Umrah — A Spiritual Journey", emoji: "🕋", nextId: "umrah" },
      { label: "A Cozy Mountain Retreat", emoji: "🏔️", nextId: "mountain" },
      { label: "A Sunset Beach Far Away", emoji: "🌊", nextId: "beach" },
      { label: "Exploring a Vibrant City", emoji: "🏙️", nextId: "city" },
      { label: "A Magical Forest Escape", emoji: "🌲", nextId: "forest" },
      { label: "Under the Northern Lights", emoji: "🌌", nextId: "aurora" },
    ],
  },
  {
    id: "umrah",
    question: "SubhanAllah. What would you want to feel most during this sacred journey?",
    subtitle: "The spiritual path unfolds...",
    options: [
      { label: "Inner Peace & Gratitude", emoji: "🤲", nextId: "umrah_peace" },
      { label: "Closeness to Allah", emoji: "✨", nextId: "umrah_closeness" },
      { label: "A Fresh Start", emoji: "🌙", nextId: "umrah_fresh" },
    ],
  },
  {
    id: "mountain",
    question: "You're at the mountain cabin. What does the perfect evening look like?",
    subtitle: "The fire crackles softly...",
    options: [
      { label: "Hot cocoa & deep conversations", emoji: "☕", nextId: "mountain_talk" },
      { label: "Stargazing under a blanket", emoji: "⭐", nextId: "mountain_stars" },
      { label: "Cooking together with music on", emoji: "🎶", nextId: "mountain_cook" },
    ],
  },
  {
    id: "beach",
    question: "The waves are singing. What's the one thing you'd want right now?",
    subtitle: "Sand between your toes...",
    options: [
      { label: "Writing our names in the sand", emoji: "💕", nextId: "beach_names" },
      { label: "Watching the sunset in silence", emoji: "🌅", nextId: "beach_sunset" },
      { label: "Dancing to the sound of waves", emoji: "💃", nextId: "beach_dance" },
    ],
  },
  {
    id: "umrah_peace",
    question: "One last thing — what's one dua you'd make with all your heart?",
    options: [
      { label: "For our family's happiness", emoji: "👨‍👩‍👧", nextId: "ending_family" },
      { label: "For blessings in everything ahead", emoji: "🌟", nextId: "ending_blessings" },
    ],
  },
  {
    id: "umrah_closeness",
    question: "Beautiful. What gift would mean the most to you from this journey?",
    options: [
      { label: "Zamzam water to share with loved ones", emoji: "💧", nextId: "ending_zamzam" },
      { label: "A prayer mat from Madinah", emoji: "🤲", nextId: "ending_prayermat" },
    ],
  },
  {
    id: "umrah_fresh",
    question: "A fresh start — what would you leave behind?",
    options: [
      { label: "All my worries and overthinking", emoji: "🍃", nextId: "ending_lettinggo" },
      { label: "Every doubt about myself", emoji: "💪", nextId: "ending_confidence" },
    ],
  },
  {
    id: "mountain_talk",
    question: "Those deep conversations... what topic always brings us closer?",
    options: [
      { label: "Our dreams for the future", emoji: "🌈", nextId: "ending_dreams" },
      { label: "Funny old memories", emoji: "😂", nextId: "ending_memories" },
    ],
  },
  {
    id: "mountain_stars",
    question: "Under the stars, what thought would cross your mind?",
    options: [
      { label: "How small our problems really are", emoji: "✨", nextId: "ending_perspective" },
      { label: "How lucky I am for this moment", emoji: "🥺", nextId: "ending_grateful" },
    ],
  },
  {
    id: "mountain_cook",
    question: "You're the chef tonight! What's on the menu?",
    options: [
      { label: "Something spicy & adventurous", emoji: "🌶️", nextId: "ending_spicy" },
      { label: "Comfort food — biryani vibes", emoji: "🍚", nextId: "ending_comfort" },
    ],
  },
  {
    id: "beach_names",
    question: "Our names in the sand... what would you write next to them?",
    options: [
      { label: "A little heart ♥", emoji: "❤️", nextId: "ending_heart" },
      { label: "Forever & always", emoji: "♾️", nextId: "ending_forever" },
    ],
  },
  {
    id: "beach_sunset",
    question: "In that silence, what would you be thinking?",
    options: [
      { label: "This is exactly where I belong", emoji: "🏠", nextId: "ending_belong" },
      { label: "I wish this moment never ends", emoji: "⏳", nextId: "ending_timeless" },
    ],
  },
  {
    id: "beach_dance",
    question: "Dancing by the waves — what song is playing?",
    options: [
      { label: "Something Bollywood & dramatic", emoji: "🎬", nextId: "ending_bollywood" },
      { label: "A soft, romantic melody", emoji: "🎵", nextId: "ending_melody" },
    ],
  },
  // City adventure path
  {
    id: "city",
    question: "You're walking through a beautiful city. What catches your eye first?",
    subtitle: "The streets are alive with possibilities...",
    options: [
      { label: "A cozy little café with fairy lights", emoji: "☕", nextId: "city_cafe" },
      { label: "A stunning art museum", emoji: "🎨", nextId: "city_museum" },
      { label: "A hidden bookstore down an alley", emoji: "📚", nextId: "city_bookstore" },
      { label: "A rooftop with the best view", emoji: "🌃", nextId: "city_rooftop" },
    ],
  },
  {
    id: "city_cafe",
    question: "You're at the café. What do you order?",
    options: [
      { label: "A fancy latte with art on top", emoji: "🎨", nextId: "ending_aesthetic" },
      { label: "Classic chai — always hits different", emoji: "🍵", nextId: "ending_chai" },
      { label: "Something new I've never tried", emoji: "✨", nextId: "ending_explorer" },
    ],
  },
  {
    id: "city_museum",
    question: "In the museum, which section do you stay longest in?",
    options: [
      { label: "The modern abstract art", emoji: "🖼️", nextId: "ending_visionary" },
      { label: "Historical artifacts & stories", emoji: "📜", nextId: "ending_storyteller" },
      { label: "The photography exhibition", emoji: "📸", nextId: "ending_photographer" },
    ],
  },
  {
    id: "city_bookstore",
    question: "You found a rare book. What's it about?",
    options: [
      { label: "Love letters from history", emoji: "💌", nextId: "ending_romantic_soul" },
      { label: "Travel adventures around the world", emoji: "🗺️", nextId: "ending_wanderer" },
      { label: "Poetry that speaks to the soul", emoji: "✒️", nextId: "ending_poet" },
    ],
  },
  {
    id: "city_rooftop",
    question: "On the rooftop, the city lights sparkle. What's your first thought?",
    options: [
      { label: "I want to capture this moment forever", emoji: "📷", nextId: "ending_moment_keeper" },
      { label: "Life is so beautiful from up here", emoji: "🌟", nextId: "ending_optimist" },
      { label: "I wish I could share this view", emoji: "💕", nextId: "ending_sharer" },
    ],
  },
  // Forest adventure path
  {
    id: "forest",
    question: "You're walking through an enchanted forest. What draws you deeper?",
    subtitle: "The trees whisper secrets...",
    options: [
      { label: "A glowing waterfall in the distance", emoji: "💧", nextId: "forest_waterfall" },
      { label: "A cozy treehouse with warm lights", emoji: "🏠", nextId: "forest_treehouse" },
      { label: "A path covered in fireflies", emoji: "✨", nextId: "forest_fireflies" },
    ],
  },
  {
    id: "forest_waterfall",
    question: "At the waterfall, the mist kisses your face. What do you do?",
    options: [
      { label: "Make a wish and throw a coin", emoji: "🌟", nextId: "ending_wishmaker" },
      { label: "Just stand and feel the peace", emoji: "🧘", nextId: "ending_peaceful" },
    ],
  },
  {
    id: "forest_treehouse",
    question: "Inside the treehouse, you find a surprise. What is it?",
    options: [
      { label: "A journal with blank pages", emoji: "📖", nextId: "ending_author" },
      { label: "A telescope pointing at the sky", emoji: "🔭", nextId: "ending_stargazer" },
    ],
  },
  {
    id: "forest_fireflies",
    question: "The fireflies lead you to a clearing. What do you see?",
    options: [
      { label: "A mirror reflecting your best self", emoji: "✨", nextId: "ending_self_love" },
      { label: "A garden of your favorite flowers", emoji: "🌸", nextId: "ending_blooming" },
    ],
  },
  // Aurora adventure path
  {
    id: "aurora",
    question: "The Northern Lights dance above you. What color captivates you most?",
    subtitle: "The sky is alive with magic...",
    options: [
      { label: "Ethereal green — like hope", emoji: "💚", nextId: "aurora_green" },
      { label: "Royal purple — like dreams", emoji: "💜", nextId: "aurora_purple" },
      { label: "Soft pink — like love", emoji: "💗", nextId: "aurora_pink" },
    ],
  },
  {
    id: "aurora_green",
    question: "The green light reminds you of...",
    options: [
      { label: "New beginnings and fresh starts", emoji: "🌱", nextId: "ending_rebirth" },
      { label: "The calm after every storm", emoji: "🌈", nextId: "ending_resilient" },
    ],
  },
  {
    id: "aurora_purple",
    question: "Under the purple sky, what do you dream of?",
    options: [
      { label: "Adventures yet to come", emoji: "🚀", nextId: "ending_adventurer" },
      { label: "Creating something beautiful", emoji: "🎨", nextId: "ending_creator" },
    ],
  },
  {
    id: "aurora_pink",
    question: "The pink glow makes your heart feel...",
    options: [
      { label: "Loved beyond measure", emoji: "💕", nextId: "ending_beloved" },
      { label: "Soft and at peace", emoji: "🕊️", nextId: "ending_serene" },
    ],
  },
];

const endings: Record<string, Ending> = {
  ending_family: {
    id: "ending_family",
    title: "The Blessed Heart",
    message: "Mehnaz, your love for family is your superpower. May Allah bless every member of your family with endless joy. You deserve a home full of laughter and love — and InshAllah, that's exactly what's coming. Happy 25th, ya Aien. 🤍",
    emoji: "🏡",
    gift: "A virtual prayer for your family's everlasting happiness 🤲✨",
  },
  ending_blessings: {
    id: "ending_blessings",
    title: "The Light Ahead",
    message: "Your faith shines through everything you do, Aien. At 25, you're stepping into the most beautiful chapter yet. May every door ahead open with barakah, and may you always feel guided. Happy Birthday, beautiful soul. 🌙",
    emoji: "🌟",
    gift: "A constellation of blessings mapped just for you ✨🗺️",
  },
  ending_zamzam: {
    id: "ending_zamzam",
    title: "The Pure Soul",
    message: "Sharing Zamzam water — that's so you, always thinking of others first. Mehnaz, your generosity is rare and beautiful. May your 25th year be filled with the purity and blessings of Zamzam itself. 💧",
    emoji: "💧",
    gift: "A promise that InshAllah, that journey is closer than you think 🕋",
  },
  ending_prayermat: {
    id: "ending_prayermat",
    title: "The Devoted Heart",
    message: "A prayer mat from Madinah — what a beautiful soul you are. Your connection with your faith inspires everyone around you. May your sajdahs always bring you peace, Aien. Happy 25th! 🤲",
    emoji: "🤲",
    gift: "A digital prayer rug woven with love and duas 🌙",
  },
  ending_lettinggo: {
    id: "ending_lettinggo",
    title: "The Free Spirit",
    message: "Letting go of worries — yes, Aien! You deserve to breathe freely. At 25, give yourself permission to be light. You've carried enough. This year, let the wind carry your worries away. 🍃",
    emoji: "🍃",
    gift: "A worry jar — let it all go, one thought at a time 🫧",
  },
  ending_confidence: {
    id: "ending_confidence",
    title: "The Unstoppable One",
    message: "Every doubt you've ever had about yourself? Wrong. All of them. Mehnaz, you are capable, you are enough, and you are extraordinary. 25 looks absolutely amazing on you. 💪",
    emoji: "👑",
    gift: "A crown because you're literally royalty 👑✨",
  },
  ending_dreams: {
    id: "ending_dreams",
    title: "The Dreamer",
    message: "You dream with your eyes wide open, Aien, and that's what makes them come true. At 25, dream even bigger. The universe is listening, and it's rooting for you. 🌈",
    emoji: "🌈",
    gift: "A dream board filled with everything your heart desires 🎯",
  },
  ending_memories: {
    id: "ending_memories",
    title: "The Memory Keeper",
    message: "Those funny memories? They're proof that we've built something beautiful together. Mehnaz, here's to making 25 more years of ridiculous, hilarious, unforgettable moments. 😂",
    emoji: "📸",
    gift: "A time capsule of our funniest moments — locked until your 30th! 🔒",
  },
  ending_perspective: {
    id: "ending_perspective",
    title: "The Wise Soul",
    message: "You see the world differently, Aien — with depth, with wonder, with wisdom beyond your years. At 25, that perspective is your greatest gift. Keep seeing the stars when others see the dark. ⭐",
    emoji: "🔭",
    gift: "A star named after you in the sky 🌠",
  },
  ending_grateful: {
    id: "ending_grateful",
    title: "The Grateful Heart",
    message: "That feeling of 'I'm lucky to be here' — hold onto it forever. Because Mehnaz, we're the lucky ones to have you. Happy 25th to the girl who makes every moment feel like a gift. 🥺",
    emoji: "🎁",
    gift: "An infinite gratitude loop — it starts and ends with you 💫",
  },
  ending_spicy: {
    id: "ending_spicy",
    title: "The Bold One",
    message: "Spicy & adventurous — just like you! Aien, your boldness is magnetic. At 25, turn up the heat on life. Try everything, fear nothing, and add extra mirchi. 🌶️",
    emoji: "🔥",
    gift: "A recipe book of adventures yet to come 📖🌶️",
  },
  ending_comfort: {
    id: "ending_comfort",
    title: "The Warm Soul",
    message: "Biryani vibes — because you bring comfort to everyone around you, Mehnaz. You are the hug people need after a long day. At 25, know that your warmth is your magic. 🍚",
    emoji: "🫕",
    gift: "A lifetime supply of warm hugs (redeemable anytime) 🤗",
  },
  ending_heart: {
    id: "ending_heart",
    title: "The Romantic",
    message: "A little heart next to our names — simple, beautiful, and pure. Just like you, Aien. At 25, may your heart always be full, always be loved, and always be brave. ❤️",
    emoji: "❤️",
    gift: "Our names, forever etched in this digital sand 🏖️",
  },
  ending_forever: {
    id: "ending_forever",
    title: "The Eternal Bond",
    message: "Forever & always — some promises are written in the stars, and ours is one of them. Mehnaz, at 25, know this: some bonds are unbreakable, and ours is infinite. ♾️",
    emoji: "♾️",
    gift: "An infinity knot — a symbol of us, always 🪢",
  },
  ending_belong: {
    id: "ending_belong",
    title: "The Found Soul",
    message: "You belong wherever your heart feels safe. And Aien, I hope you always know — you have a place in this world that no one else can fill. Happy 25th to the girl who belongs everywhere and anywhere beautiful. 🏠",
    emoji: "🏠",
    gift: "A compass that always points to where you belong 🧭",
  },
  ending_timeless: {
    id: "ending_timeless",
    title: "The Timeless Moment",
    message: "Some moments are too beautiful to end, and knowing you is one of them. Mehnaz, at 25, may every moment feel as precious as this one. Time stops for you. ⏳",
    emoji: "⌛",
    gift: "A frozen moment in time — just for you 🕰️",
  },
  ending_bollywood: {
    id: "ending_bollywood",
    title: "The Main Character",
    message: "You ARE the Bollywood heroine, Aien — dramatic, beautiful, and unforgettable! At 25, own every scene of your life. The cameras are rolling, and the world is your stage. 🎬",
    emoji: "🎬",
    gift: "A movie poster starring YOU as the hero 🌟",
  },
  ending_melody: {
    id: "ending_melody",
    title: "The Gentle Melody",
    message: "A soft, romantic melody — because that's what your presence feels like. Calm, beautiful, and something you want to hear again and again. Happy 25th, Mehnaz. You are the song. 🎵",
    emoji: "🎶",
    gift: "A playlist of songs that remind me of you 🎧",
  },
  // New city adventure endings
  ending_aesthetic: {
    id: "ending_aesthetic",
    title: "The Aesthetic Soul",
    message: "You appreciate the art in everything — even in coffee foam! Aien, your eye for beauty makes the world more magical. At 25, keep noticing the little things that make life extraordinary. 🎨",
    emoji: "✨",
    gift: "A journal for sketching all the beauty you see 📓🎨",
  },
  ending_chai: {
    id: "ending_chai",
    title: "The Classic Heart",
    message: "Chai over everything — you know what's real, what's comforting, what matters. Mehnaz, your groundedness is your strength. At 25, stay true to what warms your soul. ☕",
    emoji: "🍵",
    gift: "A chai date, anytime you need one ☕💕",
  },
  ending_explorer: {
    id: "ending_explorer",
    title: "The Curious One",
    message: "Always trying something new — that's how adventures happen! Aien, your curiosity is your compass. At 25, keep exploring, keep tasting, keep discovering. The world has so much for you. 🌍",
    emoji: "🧭",
    gift: "A passport to new experiences — metaphorically unlimited! ✈️",
  },
  ending_visionary: {
    id: "ending_visionary",
    title: "The Visionary",
    message: "Abstract art speaks to abstract thinkers. Mehnaz, you see what others miss, think what others can't. At 25, your vision is clearer than ever. Paint your future boldly. 🖼️",
    emoji: "🎨",
    gift: "A canvas for your biggest, wildest dreams 🖌️",
  },
  ending_storyteller: {
    id: "ending_storyteller",
    title: "The Storyteller",
    message: "History fascinates you because every artifact has a story — just like you have yours. Aien, at 25, you're writing a beautiful chapter. Make it legendary. 📜",
    emoji: "📖",
    gift: "A leather-bound book to write your own story in ✒️",
  },
  ending_photographer: {
    id: "ending_photographer",
    title: "The Observer",
    message: "Photography captures what words can't. Mehnaz, you see the world through a lens of wonder. At 25, keep capturing the moments that take your breath away. 📸",
    emoji: "📷",
    gift: "A vintage polaroid camera for instant memories 📸✨",
  },
  ending_romantic_soul: {
    id: "ending_romantic_soul",
    title: "The Romantic Soul",
    message: "Love letters from history — you believe in love that lasts, love that's written down, love that's timeless. Aien, at 25, know that the greatest love stories are still being written. Yours included. 💌",
    emoji: "💕",
    gift: "A sealed letter to open on your 30th birthday 💌",
  },
  ending_wanderer: {
    id: "ending_wanderer",
    title: "The Wanderer",
    message: "Travel books because your spirit craves adventure. Mehnaz, the world is waiting for you. At 25, may every road lead you somewhere beautiful. Pack light, dream big. 🗺️",
    emoji: "🌍",
    gift: "A scratch-off world map for all the places you'll go 🗺️✨",
  },
  ending_poet: {
    id: "ending_poet",
    title: "The Poet",
    message: "Poetry speaks to your soul because you feel deeply, love intensely, and see beauty in words. Aien, at 25, your heart is a poem itself — delicate, powerful, unforgettable. ✒️",
    emoji: "📝",
    gift: "A collection of poems written just for you 💫",
  },
  ending_moment_keeper: {
    id: "ending_moment_keeper",
    title: "The Moment Keeper",
    message: "You want to capture every beautiful moment — because you know how precious they are. Mehnaz, at 25, may your memory be full of moments worth keeping. 📷",
    emoji: "🎞️",
    gift: "A time capsule for your favorite 25th year memories 💝",
  },
  ending_optimist: {
    id: "ending_optimist",
    title: "The Eternal Optimist",
    message: "From up high, everything looks beautiful — and that's how you see life. Aien, your optimism lights up every room. At 25, keep looking at life from the rooftop. The view suits you. 🌟",
    emoji: "☀️",
    gift: "A pair of rose-tinted glasses (you already have them, metaphorically!) 😄",
  },
  ending_sharer: {
    id: "ending_sharer",
    title: "The Generous Heart",
    message: "Your first thought is to share — that's pure gold, Mehnaz. At 25, know that your generosity comes back to you tenfold. The view is always better shared, and you make every moment better. 💕",
    emoji: "🤝",
    gift: "A promise that you'll never experience beautiful moments alone 💑",
  },
};

const AdventureSection: React.FC = () => {
  const [currentNodeId, setCurrentNodeId] = useState<string>("start");
  const [ending, setEnding] = useState<Ending | null>(null);
  const [path, setPath] = useState<string[]>([]);

  const currentNode = storyNodes.find((n) => n.id === currentNodeId);

  const handleChoice = (nextId: string, label: string) => {
    setPath([...path, label]);
    if (endings[nextId]) {
      setEnding(endings[nextId]);
    } else {
      setCurrentNodeId(nextId);
    }
  };

  const restart = () => {
    setCurrentNodeId("start");
    setEnding(null);
    setPath([]);
  };

  return (
    <section className="py-32 px-4 relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16 relative z-10"
      >
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4 font-body">
          Your story awaits
        </p>
        <h2 className="text-3xl md:text-5xl font-display text-gradient-sunset">
          Choose Your Adventure
        </h2>
        <p className="text-muted-foreground mt-4 font-body text-sm max-w-md mx-auto">
          Every choice reveals something beautiful. There are no wrong answers — only your heart's truth.
        </p>
      </motion.div>

      <div className="max-w-2xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {ending ? (
            <motion.div
              key="ending"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="bg-card/60 backdrop-blur-sm border border-primary/20 rounded-2xl p-8 md:p-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="text-6xl mb-6"
                >
                  {ending.emoji}
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-2xl md:text-3xl font-display text-primary mb-4"
                >
                  {ending.title}
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-foreground/80 font-body leading-relaxed mb-8"
                >
                  {ending.message}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="bg-secondary/50 rounded-xl p-6 border border-primary/10 mb-8"
                >
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Your Virtual Gift</p>
                  <p className="text-lg text-primary font-display">{ending.gift}</p>
                </motion.div>

                {/* Path taken */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="mb-8"
                >
                  <p className="text-xs text-muted-foreground mb-2">Your Journey:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {path.map((p, i) => (
                      <span key={i} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                        {p}
                      </span>
                    ))}
                  </div>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4 }}
                  onClick={restart}
                  className="px-8 py-3 rounded-xl bg-gradient-sunset text-primary-foreground font-body font-semibold hover:opacity-90 transition-opacity"
                >
                  Try Another Path ✦
                </motion.button>
              </div>
            </motion.div>
          ) : currentNode ? (
            <motion.div
              key={currentNodeId}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="bg-card/60 backdrop-blur-sm border border-primary/20 rounded-2xl p-8 md:p-12">
                {currentNode.subtitle && (
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                    {currentNode.subtitle}
                  </p>
                )}
                <h3 className="text-xl md:text-2xl font-display text-foreground mb-8 leading-relaxed">
                  {currentNode.question}
                </h3>

                <div className="space-y-4">
                  {currentNode.options.map((option, i) => (
                    <motion.button
                      key={option.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      onClick={() => handleChoice(option.nextId, option.label)}
                      className="w-full p-4 rounded-xl border border-primary/10 bg-secondary/30 hover:bg-secondary/60 hover:border-primary/30 transition-all duration-300 text-left flex items-center gap-4 group"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">
                        {option.emoji}
                      </span>
                      <span className="font-body text-foreground/80 group-hover:text-foreground transition-colors">
                        {option.label}
                      </span>
                    </motion.button>
                  ))}
                </div>

                {currentNodeId !== "start" && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    onClick={restart}
                    className="mt-6 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    ← Start over
                  </motion.button>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default AdventureSection;
