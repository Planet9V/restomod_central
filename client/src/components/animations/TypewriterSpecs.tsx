import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Specification {
  title: string;
  value: string;
}

interface TypewriterSpecsProps {
  specifications: Specification[];
  typingSpeed?: number;
  delayBetweenItems?: number;
}

export const TypewriterSpecs: React.FC<TypewriterSpecsProps> = ({
  specifications,
  typingSpeed = 30,
  delayBetweenItems = 500
}) => {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [displayedValue, setDisplayedValue] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  
  useEffect(() => {
    if (currentItemIndex >= specifications.length) {
      return;
    }

    const currentSpec = specifications[currentItemIndex];
    const targetValue = currentSpec.value;
    
    if (displayedValue === targetValue) {
      // Typing is complete for current item, prepare for next item
      const timer = setTimeout(() => {
        if (currentItemIndex < specifications.length - 1) {
          setCurrentItemIndex(prevIndex => prevIndex + 1);
          setDisplayedValue("");
          setIsTyping(true);
        }
      }, delayBetweenItems);
      
      return () => clearTimeout(timer);
    }
    
    if (isTyping) {
      const timer = setTimeout(() => {
        setDisplayedValue(targetValue.substring(0, displayedValue.length + 1));
      }, typingSpeed);
      
      return () => clearTimeout(timer);
    }
  }, [currentItemIndex, displayedValue, isTyping, specifications, typingSpeed, delayBetweenItems]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 mb-4">
      {specifications.map((spec, index) => (
        <motion.div 
          key={spec.title}
          className={`px-6 py-4 rounded-sm border ${index === currentItemIndex ? 'border-burgundy bg-white shadow-md' : 'border-charcoal/10 bg-white/50'}`}
          initial={{ opacity: 0.5, y: 20 }}
          animate={{ 
            opacity: index <= currentItemIndex ? 1 : 0.5,
            y: index <= currentItemIndex ? 0 : 20,
            scale: index === currentItemIndex ? 1.05 : 1
          }}
          transition={{ duration: 0.4 }}
        >
          <h3 className="text-lg font-medium text-charcoal mb-1">{spec.title}</h3>
          <p className="text-burgundy font-playfair text-xl">
            {index < currentItemIndex ? spec.value : (
              index === currentItemIndex ? displayedValue : ""
            )}
            {index === currentItemIndex && (
              <span className="inline-block w-0.5 h-5 bg-burgundy ml-1 animate-pulse"></span>
            )}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

export default TypewriterSpecs;