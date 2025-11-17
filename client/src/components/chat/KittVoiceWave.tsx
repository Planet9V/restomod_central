/**
 * K.I.T.T. Voice Wave Animation
 * Animated scanner effect inspired by K.I.T.T.'s iconic voice indicator
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface KittVoiceWaveProps {
  isActive?: boolean;
  className?: string;
}

export function KittVoiceWave({ isActive = true, className }: KittVoiceWaveProps) {
  // Number of bars in the voice wave
  const barCount = 7;
  const bars = Array.from({ length: barCount }, (_, i) => i);

  return (
    <div className={cn('flex items-center justify-center gap-0.5 h-6', className)}>
      {bars.map((index) => {
        // Center bar has highest amplitude
        const distanceFromCenter = Math.abs(index - Math.floor(barCount / 2));
        const maxHeight = 1 - (distanceFromCenter / barCount) * 0.6;

        return (
          <motion.div
            key={index}
            className="w-1 bg-gradient-to-t from-purple-600 via-purple-500 to-purple-400 rounded-full"
            animate={
              isActive
                ? {
                    height: [
                      `${20 + Math.random() * 20}%`,
                      `${maxHeight * 100}%`,
                      `${20 + Math.random() * 20}%`,
                    ],
                    opacity: [0.5, 1, 0.5],
                  }
                : {
                    height: '20%',
                    opacity: 0.3,
                  }
            }
            transition={{
              duration: 0.6 + Math.random() * 0.4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.05,
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * K.I.T.T. Scanner Line
 * Horizontal scanning effect
 */
export function KittScanner({ className }: { className?: string }) {
  return (
    <div className={cn('relative h-1 bg-black/40 rounded-full overflow-hidden', className)}>
      <motion.div
        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
        animate={{
          left: ['-33%', '100%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
