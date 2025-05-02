import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { type Project } from "@shared/schema";

interface FeaturedProjectData extends Omit<Project, 'createdAt'> {
  award?: {
    title: string;
    subtitle: string;
  };
  createdAt: string | Date;
}

const FeaturedProject = () => {
  const { data: featuredProject, isLoading } = useQuery<FeaturedProjectData>({
    queryKey: ['/api/projects/featured'],
    staleTime: Infinity,
  });

  // Initialize reveal animation on scroll
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal');
    
    function checkReveal() {
      const windowHeight = window.innerHeight;
      const revealPoint = 150;
      
      revealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < windowHeight - revealPoint) {
          element.classList.add('active');
        }
      });
    }
    
    // Initial check and scroll event listener
    checkReveal();
    window.addEventListener('scroll', checkReveal);
    
    return () => window.removeEventListener('scroll', checkReveal);
  }, []);

  if (isLoading) {
    return <div className="py-24 bg-offwhite text-charcoal">Loading...</div>;
  }

  // Fallback data if API doesn't return
  const project = featuredProject || {
    id: 0,
    title: "1967 Mustang Fastback",
    subtitle: "The perfect blend of iconic styling with contemporary performance and comfort.",
    slug: "1967-mustang-fastback",
    description: "This 1967 Mustang Fastback represents the pinnacle of our engineering-meets-artistry approach.",
    category: "american-muscle",
    imageUrl: "https://images.unsplash.com/photo-1588127333419-b9d7de223dcf?q=80&w=1600&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1588127333419-b9d7de223dcf?q=80&w=1600&auto=format&fit=crop",
    ],
    specs: {
      performance: "435 HP Coyote V8",
      transmission: "6-Speed Manual",
      suspension: "Custom Engineered IRS",
      buildTime: "2,400 Hours"
    },
    features: [
      "Modern fuel injection system with custom ECU tuning",
      "Climate control system with vintage-look controls"
    ],
    featured: true,
    createdAt: new Date().toISOString(),
    clientQuote: "The attention to detail is amazing.",
    clientName: "John Smith",
    clientLocation: "Austin, TX",
    award: {
      title: "2023 Grand National Roadster Show",
      subtitle: "Best in Class Award Winner"
    }
  } as FeaturedProjectData;

  return (
    <section id="featured" className="py-24 bg-offwhite text-charcoal overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 lg:pr-12 mb-12 lg:mb-0">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-6 reveal">
              Featured Project
            </h2>
            <div className="mb-8 reveal">
              <h3 className="text-2xl font-medium mb-2 font-playfair">{project.title}</h3>
              <p className="text-charcoal/80 mb-4">{project.subtitle}</p>
              <div className="grid grid-cols-2 gap-6 mb-6">
                {Object.entries(project.specs).map(([key, value], index) => (
                  <div key={index}>
                    <h4 className="text-sm uppercase tracking-wider text-charcoal/60 mb-1">
                      {key}
                    </h4>
                    <p className="font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <Link href={`/projects/${project.slug}`} className="inline-flex items-center text-burgundy hover:text-burgundy/80 font-medium reveal">
                View Project Details
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
            </Link>
          </div>
          <div className="lg:w-1/2 reveal">
            <div className="relative">
              <img
                src={project.imageUrl}
                alt={project.title}
                className="w-full h-auto rounded-sm shadow-xl"
              />
              {project.award && (
                <div className="absolute -bottom-6 -left-6 bg-gold text-charcoal p-4 shadow-lg">
                  <p className="text-sm font-medium">{project.award.title}</p>
                  <p className="text-xs">{project.award.subtitle}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProject;
