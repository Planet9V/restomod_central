import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  imageSrc: string;
}

const PageHeader = ({ title, subtitle, imageSrc }: PageHeaderProps) => {
  return (
    <div className="relative overflow-hidden">
      <div 
        className="w-full h-[50vh] md:h-[60vh] lg:h-[70vh]" 
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${imageSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8,
              ease: [0.165, 0.84, 0.44, 1]
            }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-white mb-4">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xl md:text-2xl text-white/85 max-w-3xl">
                {subtitle}
              </p>
            )}
          </motion.div>
        </div>
      </div>
      
      <motion.div 
        className="bg-burgundy h-2"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ 
          duration: 1.2, 
          delay: 0.2,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
        style={{ transformOrigin: 'left' }}
      />
    </div>
  );
};

export default PageHeader;