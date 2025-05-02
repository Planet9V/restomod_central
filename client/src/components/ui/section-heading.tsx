import { ReactNode } from "react";

interface SectionHeadingProps {
  title: string;
  description?: string;
  center?: boolean;
  children?: ReactNode;
  className?: string;
}

const SectionHeading = ({
  title,
  description,
  center = true,
  children,
  className = "",
}: SectionHeadingProps) => {
  return (
    <div className={`${center ? "text-center" : ""} ${className} reveal`}>
      <div className={`${center ? "max-w-3xl mx-auto" : ""} mb-16`}>
        <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-6">
          {title}
        </h2>
        {description && (
          <p className="text-lg text-current/80">
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
};

export default SectionHeading;
