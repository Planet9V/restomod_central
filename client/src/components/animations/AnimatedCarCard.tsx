import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Tilt from 'react-tilt';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart, ArrowRight } from 'lucide-react';

interface AnimatedCarCardProps {
  car: {
    id: number;
    title: string;
    subtitle: string;
    imageUrl: string;
    category: string;
    featured: boolean;
    specs?: Record<string, string>;
    slug: string;
  };
  index: number;
}

export function AnimatedCarCard({ car, index }: AnimatedCarCardProps) {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  const imageVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
  };

  const tiltOptions = {
    reverse: false,
    max: 15,
    perspective: 1000,
    scale: 1.02,
    speed: 1000,
    transition: true,
    axis: null,
    reset: true,
    easing: "cubic-bezier(.03,.98,.52,.99)",
  };

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="group"
    >
      <Tilt options={tiltOptions}>
        <motion.div
          className="relative overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-900"
          whileHover="hover"
          initial="rest"
        >
          {/* Featured Badge */}
          {car.featured && (
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              className="absolute top-4 right-4 z-20"
            >
              <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg">
                Featured
              </Badge>
            </motion.div>
          )}

          {/* Image Container */}
          <div className="relative h-64 overflow-hidden">
            <motion.img
              variants={imageVariants}
              src={car.imageUrl}
              alt={car.title}
              className="w-full h-full object-cover"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Hover Overlay */}
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              whileHover="visible"
              className="absolute inset-0 bg-black/40 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex gap-3"
              >
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 hover:bg-white text-black"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 hover:bg-white text-black"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Category Badge */}
            <div className="absolute bottom-4 left-4">
              <Badge variant="secondary" className="bg-white/90 text-black">
                {car.category.replace('-', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <motion.h3
              className="text-xl font-bold text-gray-900 dark:text-white mb-2"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {car.title}
            </motion.h3>
            
            <motion.p
              className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.05 }}
            >
              {car.subtitle}
            </motion.p>

            {/* Specs Preview */}
            {car.specs && (
              <motion.div
                className="grid grid-cols-2 gap-2 mb-4"
                initial={{ opacity: 0, height: 0 }}
                whileHover={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                {Object.entries(car.specs).slice(0, 2).map(([key, value]) => (
                  <div key={key} className="text-xs">
                    <span className="text-gray-500 dark:text-gray-400">{key}:</span>
                    <span className="ml-1 font-medium text-gray-700 dark:text-gray-200">{value}</span>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Action Button */}
            <motion.div
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Button
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white group"
                size="sm"
              >
                Explore Build
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </div>

          {/* Animated Border */}
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-transparent"
            whileHover={{
              borderImage: "linear-gradient(45deg, #f59e0b, #d97706) 1",
              borderImageSlice: 1,
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </Tilt>
    </motion.div>
  );
}