import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Car, Gauge, Zap, Settings } from 'lucide-react';

interface TypewriterSpecsProps {
  specs: Record<string, string>;
  title?: string;
  className?: string;
}

export function TypewriterSpecs({ specs, title = "Specifications", className = "" }: TypewriterSpecsProps) {
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  const [displayedSpecs, setDisplayedSpecs] = useState<Record<string, string>>({});
  const [currentSpecIndex, setCurrentSpecIndex] = useState(0);
  const specEntries = Object.entries(specs);

  useEffect(() => {
    if (!inView) return;

    const typewriterEffect = async () => {
      for (let i = 0; i < specEntries.length; i++) {
        const [key, value] = specEntries[i];
        setCurrentSpecIndex(i);
        
        // Type out the value character by character
        for (let j = 0; j <= value.length; j++) {
          await new Promise(resolve => setTimeout(resolve, 50));
          setDisplayedSpecs(prev => ({
            ...prev,
            [key]: value.slice(0, j)
          }));
        }
        
        // Small pause before next spec
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    };

    // Start typewriter effect after component is in view
    const timer = setTimeout(typewriterEffect, 500);
    return () => clearTimeout(timer);
  }, [inView, specEntries]);

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const specVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const getSpecIcon = (key: string) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('engine') || lowerKey.includes('motor')) {
      return <Car className="h-4 w-4 text-amber-400" />;
    }
    if (lowerKey.includes('power') || lowerKey.includes('hp') || lowerKey.includes('torque')) {
      return <Zap className="h-4 w-4 text-blue-400" />;
    }
    if (lowerKey.includes('speed') || lowerKey.includes('acceleration') || lowerKey.includes('0-60')) {
      return <Gauge className="h-4 w-4 text-green-400" />;
    }
    return <Settings className="h-4 w-4 text-gray-400" />;
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-sm border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <motion.div
              animate={{ rotate: inView ? 360 : 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <Settings className="h-5 w-5 text-amber-400" />
            </motion.div>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {specEntries.map(([key, value], index) => (
            <motion.div
              key={key}
              variants={specVariants}
              initial="hidden"
              animate={currentSpecIndex >= index ? "visible" : "hidden"}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  {getSpecIcon(key)}
                  <span className="text-sm font-medium text-slate-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-white">
                    {displayedSpecs[key] || ''}
                    {currentSpecIndex === index && displayedSpecs[key]?.length < value.length && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="text-amber-400"
                      >
                        |
                      </motion.span>
                    )}
                  </span>
                </div>
              </div>
              {index < specEntries.length - 1 && (
                <Separator className="bg-slate-700/50" />
              )}
            </motion.div>
          ))}
          
          {/* Performance Indicators */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView && currentSpecIndex >= specEntries.length - 1 ? 
              { opacity: 1, scale: 1 } : 
              { opacity: 0, scale: 0.9 }
            }
            transition={{ delay: 1.5, duration: 0.6 }}
            className="mt-6 pt-4 border-t border-slate-700/50"
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                className="p-3 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30"
              >
                <div className="text-lg font-bold text-amber-400">A+</div>
                <div className="text-xs text-slate-300">Performance</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                className="p-3 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30"
              >
                <div className="text-lg font-bold text-green-400">95%</div>
                <div className="text-xs text-slate-300">Efficiency</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30"
              >
                <div className="text-lg font-bold text-blue-400">5★</div>
                <div className="text-xs text-slate-300">Rating</div>
              </motion.div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}