import { cn } from "@/lib/utils";

interface ProcessStepProps {
  step: number;
  title: string;
  description: string;
  image: string;
  alt: string;
  isReversed?: boolean;
}

const ProcessStep = ({
  step,
  title,
  description,
  image,
  alt,
  isReversed = false,
}: ProcessStepProps) => {
  return (
    <div className={`md:flex items-center mb-16 md:mb-24 reveal ${isReversed ? 'flex-row-reverse' : ''}`}>
      <div className={cn(
        "md:w-1/2 mb-8 md:mb-0",
        isReversed ? "md:pl-12" : "md:pr-12 md:text-right"
      )}>
        <span className="inline-block text-xs font-medium tracking-wider text-burgundy mb-2">
          STEP {step.toString().padStart(2, '0')}
        </span>
        <h3 className="font-playfair text-2xl font-medium mb-4">{title}</h3>
        <p className="text-offwhite/80">{description}</p>
      </div>
      <div className={cn(
        "md:w-1/2 relative",
        isReversed ? "md:pr-12" : "md:pl-12"
      )}>
        <div className={cn(
          "absolute top-0 w-6 h-6 bg-burgundy rounded-full hidden md:block",
          isReversed ? "-right-3" : "-left-3"
        )}></div>
        <img
          src={image}
          alt={alt}
          className="w-full h-auto rounded-sm shadow-lg"
        />
      </div>
    </div>
  );
};

export default ProcessStep;
