import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PROJECT_CATEGORIES } from "@/lib/constants";
import SectionHeading from "@/components/ui/section-heading";
import ProjectCard from "@/components/ui/project-card";
import { Link } from "wouter";
import { type Project } from "@shared/schema";
import { imageService } from "@/services/imageService";

const ProjectGallery = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: rawProjects, isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    staleTime: Infinity,
  });
  
  // Apply image service to update project images
  const projects = rawProjects ? imageService.updateProjectsImages(rawProjects as any[]) : [];

  // Filter projects by category
  const filteredProjects = activeCategory === 'all'
    ? projects
    : projects?.filter((project: Project) => project.category === activeCategory);

  return (
    <section id="projects" className="py-24 bg-offwhite text-charcoal">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Our Projects"
          description="Each vehicle represents hundreds of hours of design, engineering, and craftsmanship. Explore our collection of bespoke creations."
        />
        
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
        
        {isLoading ? (
          <div className="text-center py-12">Loading projects...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 reveal">
            {/* Fallback to empty array if API call fails */}
            {(filteredProjects || []).map((project: Project) => (
              <ProjectCard
                key={project.id}
                id={String(project.id)}
                title={project.title}
                subtitle={project.subtitle}
                imageUrl={project.imageUrl}
                slug={project.slug}
              />
            ))}
            
            {/* Fallback projects if API returns no data */}
            {(!filteredProjects || filteredProjects.length === 0) && (
              <>
                <ProjectCard
                  id="1"
                  title="1969 Chevrolet Camaro"
                  subtitle="Pro-Touring | 650HP LS7"
                  imageUrl="https://images.unsplash.com/photo-1583267746897-2cf66319ef97?q=80&w=1600&auto=format&fit=crop"
                  slug="1969-chevrolet-camaro"
                />
                <ProjectCard
                  id="2"
                  title="1965 Porsche 911"
                  subtitle="Singer-Inspired | 3.8L Flat-Six"
                  imageUrl="https://images.unsplash.com/photo-1591293836027-e05b48473b67?q=80&w=1600&auto=format&fit=crop"
                  slug="1965-porsche-911"
                />
                <ProjectCard
                  id="3"
                  title="1970 Ford Bronco"
                  subtitle="Luxury 4x4 | 5.0 Coyote V8"
                  imageUrl="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1600&auto=format&fit=crop"
                  slug="1970-ford-bronco"
                />
                <ProjectCard
                  id="4"
                  title="1957 Chevrolet Bel Air"
                  subtitle="Classic Cruiser | Supercharged LT4"
                  imageUrl="https://images.unsplash.com/photo-1603386329225-868361163bbe?q=80&w=1600&auto=format&fit=crop"
                  slug="1957-chevrolet-bel-air"
                />
                <ProjectCard
                  id="5"
                  title="1965 Shelby Cobra"
                  subtitle="Modern Replica | 427 Windsor"
                  imageUrl="https://images.unsplash.com/photo-1611566026373-c6c8da0945b8?q=80&w=1600&auto=format&fit=crop"
                  slug="1965-shelby-cobra"
                />
                <ProjectCard
                  id="6"
                  title="1972 Datsun 240Z"
                  subtitle="JDM Legend | RB26 Turbo"
                  imageUrl="https://images.unsplash.com/photo-1547245324-d529cde1c833?q=80&w=1600&auto=format&fit=crop"
                  slug="1972-datsun-240z"
                />
              </>
            )}
          </div>
        )}
        
        <div className="text-center mt-12 reveal">
          <Link href="/projects" className="inline-block border border-charcoal text-charcoal hover:bg-charcoal hover:text-white transition-colors duration-200 px-8 py-4 text-sm uppercase tracking-wider font-medium">
            View All Projects
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProjectGallery;
