import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { ChevronRight, Wrench, Award, Clock } from 'lucide-react';

interface AnimatedHeroProps {
  heroData: {
    title: string;
    subtitle: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    backgroundVideo?: string;
  };
}

export function AnimatedHero({ heroData }: AnimatedHeroProps) {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 60, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const statsVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.6,
        delay: 1.2,
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background Pattern */}
      <motion.div
        className="absolute inset-0 opacity-10"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Main Content */}
      <motion.div
        className="container mx-auto px-6 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Floating Icons */}
          <motion.div variants={floatingVariants} animate="animate" className="absolute -top-20 left-10 opacity-20">
            <Wrench className="h-12 w-12 text-amber-400" />
          </motion.div>
          <motion.div 
            variants={floatingVariants} 
            animate="animate" 
            className="absolute -top-16 right-16 opacity-20"
            style={{ animationDelay: '2s' }}
          >
            <Award className="h-10 w-10 text-amber-400" />
          </motion.div>

          {/* Main Title */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-amber-200 bg-clip-text text-transparent"
          >
            {heroData.title}
          </motion.h1>

          {/* Subtitle */}
          <motion.h2
            variants={itemVariants}
            className="text-xl md:text-2xl mb-8 text-gray-300 font-light"
          >
            {heroData.subtitle}
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl mb-10 text-gray-400 max-w-3xl mx-auto leading-relaxed"
          >
            {heroData.description}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white px-8 py-3 text-lg font-semibold shadow-xl"
              >
                {heroData.primaryCta}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white hover:text-slate-900 px-8 py-3 text-lg font-semibold"
              >
                {heroData.secondaryCta}
              </Button>
            </motion.div>
          </motion.div>

          {/* Animated Stats */}
          <motion.div
            variants={statsVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <motion.div
              whileHover={{ y: -5 }}
              className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <div className="text-3xl font-bold text-amber-400 mb-2">25+</div>
              <div className="text-gray-300">Years Experience</div>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5 }}
              className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <div className="text-3xl font-bold text-amber-400 mb-2">500+</div>
              <div className="text-gray-300">Restomods Built</div>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5 }}
              className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <div className="text-3xl font-bold text-amber-400 mb-2">100%</div>
              <div className="text-gray-300">Client Satisfaction</div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-white/60 rounded-full mt-2"
            animate={{
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}