import { Link } from "wouter";

interface ProjectCardProps {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  slug: string;
}

const ProjectCard = ({ id, title, subtitle, imageUrl, slug }: ProjectCardProps) => {
  return (
    <div className="hover-lift group">
      <Link href={`/projects/${slug}`} className="block">
        <div className="relative overflow-hidden rounded-sm">
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-fade opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
            <div className="p-6">
              <h3 className="font-playfair text-xl font-medium text-white">{title}</h3>
              <p className="text-white/80 text-sm">{subtitle}</p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProjectCard;
