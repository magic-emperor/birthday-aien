import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isBirthday, setIsBirthday] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      let birthday = new Date(`${currentYear}-04-08T00:00:00+05:30`);

      if (now > birthday) {
        birthday = new Date(`${currentYear + 1}-04-08T00:00:00+05:30`);
      }

      const diff = birthday.getTime() - now.getTime();

      if (diff <= 0) {
        setIsBirthday(true);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  if (isBirthday) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 10 }}
        className="text-center"
      >
        <h2 className="text-4xl md:text-6xl font-display text-gradient-sunset mb-4">
          🎂 It's Her Day! 🎂
        </h2>
        <p className="text-lg text-foreground/80 font-body">
          Happy 25th Birthday, Mehnaz! 🎉
        </p>
      </motion.div>
    );
  }

  return (
    <div className="flex gap-3 md:gap-6 justify-center">
      {timeUnits.map((unit, i) => (
        <motion.div
          key={unit.label}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + i * 0.1, duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-xl bg-card/60 backdrop-blur-sm border border-primary/20 flex items-center justify-center animate-pulse-glow">
            <motion.span
              key={unit.value}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-2xl md:text-4xl font-display text-primary"
            >
              {String(unit.value).padStart(2, '0')}
            </motion.span>
          </div>
          <span className="mt-2 text-xs md:text-sm text-muted-foreground font-body uppercase tracking-widest">
            {unit.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

export default CountdownTimer;
