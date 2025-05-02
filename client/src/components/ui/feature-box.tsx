import { LucideIcon } from "lucide-react";
import { Settings, Mic, Users } from "lucide-react";

interface FeatureBoxProps {
  title: string;
  description: string;
  icon: string;
}

// Icon map for the feature boxes
const IconMap: Record<string, LucideIcon> = {
  Settings,
  Mic,
  Users,
};

const FeatureBox = ({ title, description, icon }: FeatureBoxProps) => {
  const IconComponent = IconMap[icon] || Settings;

  return (
    <div className="mb-8">
      <h3 className="flex items-center font-playfair text-xl font-medium mb-3">
        <span className="inline-block w-8 h-8 bg-burgundy mr-3 flex items-center justify-center rounded-sm">
          <IconComponent className="h-5 w-5" />
        </span>
        {title}
      </h3>
      <p className="text-offwhite/80 pl-11">
        {description}
      </p>
    </div>
  );
};

export default FeatureBox;
