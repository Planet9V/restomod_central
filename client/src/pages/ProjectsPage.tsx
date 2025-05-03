import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PROJECT_CATEGORIES } from "@/lib/constants";
import ProjectCard from "@/components/ui/project-card";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { imageService } from "@/services/imageService";

const ProjectsPage = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  // Initialize scroll reveal animations
  useEffect(() => {
    const handleScroll = () => {
      const revealElements = document.querySelectorAll('.reveal');
      const windowHeight = window.innerHeight;
      const revealPoint = 150;
      
      revealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < windowHeight - revealPoint) {
          element.classList.add('active');
        }
      });
    };
    
    // Initial check and scroll event listener
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { data: rawProjects, isLoading } = useQuery({
    queryKey: ['/api/projects'],
    staleTime: Infinity,
  });
  
  // Apply image service to update project images
  const projects = rawProjects ? imageService.updateProjectsImages(rawProjects as any[]) : [];

  // Filter projects by category
  const filteredProjects = activeCategory === 'all'
    ? projects
    : projects?.filter(project => project.category === activeCategory);

  // Fallback projects if API returns no data
  const fallbackProjects = [
    {
      id: "1",
      title: "1969 Chevrolet Camaro",
      subtitle: "Pro-Touring | 650HP LS7",
      imageUrl: "https://images.unsplash.com/photo-1583267746897-2cf66319ef97?q=80&w=1600&auto=format&fit=crop",
      slug: "1969-chevrolet-camaro",
      category: "american-muscle"
    },
    {
      id: "2",
      title: "1965 Porsche 911",
      subtitle: "Singer-Inspired | 3.8L Flat-Six",
      imageUrl: "https://images.unsplash.com/photo-1591293836027-e05b48473b67?q=80&w=1600&auto=format&fit=crop",
      slug: "1965-porsche-911",
      category: "european-classics"
    },
    {
      id: "3",
      title: "1970 Ford Bronco",
      subtitle: "Luxury 4x4 | 5.0 Coyote V8",
      imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1600&auto=format&fit=crop",
      slug: "1970-ford-bronco",
      category: "trucks-4x4s"
    },
    {
      id: "4",
      title: "1957 Chevrolet Bel Air",
      subtitle: "Classic Cruiser | Supercharged LT4",
      imageUrl: "https://images.unsplash.com/photo-1603386329225-868361163bbe?q=80&w=1600&auto=format&fit=crop",
      slug: "1957-chevrolet-bel-air",
      category: "american-muscle"
    },
    {
      id: "5",
      title: "1965 Shelby Cobra",
      subtitle: "Modern Replica | 427 Windsor",
      imageUrl: "https://images.unsplash.com/photo-1611566026373-c6c8da0945b8?q=80&w=1600&auto=format&fit=crop",
      slug: "1965-shelby-cobra",
      category: "american-muscle"
    },
    {
      id: "6",
      title: "1972 Datsun 240Z",
      subtitle: "JDM Legend | RB26 Turbo",
      imageUrl: "https://images.unsplash.com/photo-1547245324-d529cde1c833?q=80&w=1600&auto=format&fit=crop",
      slug: "1972-datsun-240z",
      category: "european-classics"
    },
    {
      id: "7",
      title: "1963 Jaguar E-Type",
      subtitle: "Roadster | Fuel-Injected XK6",
      imageUrl: "https://images.unsplash.com/photo-1583267746897-2cf66319ef97?q=80&w=1600&auto=format&fit=crop",
      slug: "1963-jaguar-e-type",
      category: "european-classics"
    },
    {
      id: "8",
      title: "1969 Ford Mustang Mach 1",
      subtitle: "In Progress | 5.0 Coyote Swap",
      imageUrl: "https://images.unsplash.com/photo-1603386329225-868361163bbe?q=80&w=1600&auto=format&fit=crop",
      slug: "1969-ford-mustang-mach-1",
      category: "in-progress"
    }
  ];

  // If no projects from API, use fallback
  const displayProjects = 
    (filteredProjects && filteredProjects.length > 0) 
      ? filteredProjects 
      : activeCategory === 'all' 
        ? fallbackProjects 
        : fallbackProjects.filter(p => p.category === activeCategory);

  return (
    <div className="bg-offwhite text-charcoal pt-32 pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-burgundy hover:text-burgundy/80 font-medium">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Page heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 reveal">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-6">
            Our Projects
          </h1>
          <p className="text-lg text-charcoal/80">
            Browse our collection of meticulously crafted restomods. Each vehicle represents hundreds of hours of engineering and artistry.
          </p>
        </div>
        
        {/* Category filters */}
        <div className="flex justify-center mb-12 reveal">
          <div className="inline-flex flex-wrap justify-center gap-2">
            {PROJECT_CATEGORIES.map((category) => (
              <button
                key={category.id}
                className={`px-6 py-2 text-sm uppercase tracking-wider font-medium rounded-sm transition-all duration-200 ${
                  activeCategory === category.id
                    ? "bg-charcoal text-white"
                    : "bg-transparent text-charcoal hover:bg-charcoal/10"
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Projects grid */}
        {isLoading ? (
          <div className="text-center py-12">Loading projects...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 reveal">
            {displayProjects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                subtitle={project.subtitle}
                imageUrl={project.imageUrl}
                slug={project.slug}
              />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="bg-charcoal text-white p-8 rounded-sm mt-16 text-center reveal">
          <h2 className="font-playfair text-2xl font-medium mb-4">
            Ready to Create Your Dream Vehicle?
          </h2>
          <p className="mb-6 text-white/80 max-w-2xl mx-auto">
            Let's discuss how Skinny's Rod and Custom can bring your vision to life with our unique combination of engineering excellence and master craftsmanship.
          </p>
          <Link href="/#contact" className="inline-block bg-burgundy hover:bg-burgundy/90 transition-colors duration-200 px-8 py-4 text-sm uppercase tracking-wider font-medium">
            Request a Consultation
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
