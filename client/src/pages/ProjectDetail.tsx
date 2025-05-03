import { Link, useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import { useEffect } from "react";
import { type Project } from "@shared/schema";
import { imageService } from "@/services/imageService";

interface ProjectDetailData extends Partial<Project> {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  galleryImages: string[];
  specs: Record<string, string>;
  features: string[];
  historicalInfo?: Record<string, string>;
  client?: {
    quote: string;
    name: string;
    location: string;
  };
}

const ProjectDetail = () => {
  const { id } = useParams();
  const [_, navigate] = useLocation();

  const { data: rawProject, isLoading, isError } = useQuery<ProjectDetailData>({
    queryKey: [`/api/projects/${id}`],
    staleTime: Infinity,
  });
  
  // Apply image service to update project images
  const project = rawProject ? imageService.updateProjectImages(rawProject) : null;

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

  // Redirect to 404 if project not found
  if (isError) {
    navigate("/not-found");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-offwhite">
        <div className="text-2xl text-charcoal">Loading project details...</div>
      </div>
    );
  }

  // Fallback data if API doesn't return
  const projectData: ProjectDetailData = project || {
    title: "1967 Mustang Fastback",
    subtitle: "The perfect blend of iconic styling with contemporary performance and comfort.",
    description: "This 1967 Mustang Fastback represents the pinnacle of our engineering-meets-artistry approach. Every aspect of this vehicle has been meticulously reimagined while preserving the soul and character of the original design.",
    imageUrl: "https://images.unsplash.com/photo-1588127333419-b9d7de223dcf?q=80&w=1600&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1583267746897-2cf66319ef97?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583267746897-2cf66319ef97?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583267746897-2cf66319ef97?q=80&w=1600&auto=format&fit=crop",
    ],
    specs: {
      performance: "435 HP Coyote V8",
      transmission: "6-Speed Manual",
      suspension: "Custom Engineered IRS",
      brakes: "Wilwood 6-piston front, 4-piston rear",
      wheels: "18-inch custom forged aluminum",
      buildTime: "2,400 Hours",
    },
    features: [
      "Modern fuel injection system with custom ECU tuning",
      "Climate control system with vintage-look controls",
      "Custom leather interior with period-correct styling",
      "Modern audio system with smartphone connectivity",
      "Power steering and brakes",
      "LED lighting with original appearance",
    ],
    historicalInfo: {
      significance: "The 1967 Mustang Fastback is one of the most iconic American muscle cars ever produced. It represents the evolution of the original pony car into a true performance vehicle.",
      originalSpecs: "Originally equipped with engines ranging from a 200 cubic-inch inline-six to the powerful 390 cubic-inch V8 producing 320 horsepower. The car featured a four-speed manual or three-speed automatic transmission.",
      designElements: "The fastback roofline introduced in 1965 became an instant classic, creating one of the most recognizable profiles in automotive history. The design has influenced countless vehicles since its introduction.",
      productionNumbers: "Ford produced approximately 472,000 Mustangs in 1967, with about 71,000 being fastback models.",
      collectibility: "Due to their starring role in films like 'Bullitt' and 'Gone in 60 Seconds,' pristine 1967 Fastbacks can fetch $100,000-$150,000 at auction, with exceptionally rare or historically significant examples commanding even higher prices.",
      culturalImpact: "The 1967 Mustang Fastback helped cement the Mustang's place in American car culture and has become a symbol of 1960s automotive design excellence."
    },
    client: {
      quote: "The attention to detail and engineering excellence exceeded all expectations. It's the perfect blend of classic style and modern performance.",
      name: "Robert Maxwell",
      location: "Portland, Oregon"
    }
  };

  return (
    <div className="bg-offwhite text-charcoal pt-24">
      {/* Project Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src={projectData.imageUrl}
          alt={projectData.title}
          className="absolute w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="container mx-auto">
            <h1 className="font-playfair text-4xl md:text-5xl text-white font-bold mb-4">
              {projectData.title}
            </h1>
            <p className="text-xl text-white/90 max-w-3xl">
              {projectData.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Back button */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/projects">
          <Button variant="outline" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Projects</span>
          </Button>
        </Link>
      </div>

      {/* Project Details */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-16">
          <div className="reveal">
            <h2 className="font-playfair text-3xl font-bold mb-6">Overview</h2>
            <p className="text-lg text-charcoal/80 mb-8">
              {projectData.description}
            </p>

            <h3 className="font-playfair text-2xl font-medium mb-4">Specifications</h3>
            <div className="grid grid-cols-2 gap-6 mb-8">
              {Object.entries(projectData.specs).map(([key, value]: [string, string]) => (
                <div key={key}>
                  <h4 className="text-sm uppercase tracking-wider text-charcoal/60 mb-1">
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  </h4>
                  <p className="font-medium">{value}</p>
                </div>
              ))}
            </div>

            <h3 className="font-playfair text-2xl font-medium mb-4">Features</h3>
            <ul className="space-y-2 mb-8">
              {projectData.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-burgundy mr-2 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* Historical Information Section */}
            {projectData.historicalInfo && Object.keys(projectData.historicalInfo).length > 0 && (
              <div className="my-8">
                <h3 className="font-playfair text-2xl font-medium mb-4">Historical Significance</h3>
                <div className="border-l-4 border-burgundy pl-4 space-y-4 mb-8">
                  {Object.entries(projectData.historicalInfo).map(([key, value]: [string, string], index: number) => (
                    <div key={index}>
                      <h4 className="font-medium text-lg capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <p className="text-charcoal/80">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Client Testimonial */}
            {projectData.client && (
              <div className="bg-charcoal p-6 rounded-sm text-white mt-8">
                <svg
                  className="h-8 w-8 text-gold mb-4"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                  aria-hidden="true"
                >
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <p className="text-white/90 mb-4 italic">{projectData.client.quote}</p>
                <p className="font-medium">
                  {projectData.client.name}, {projectData.client.location}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6 reveal">
            {projectData.galleryImages.map((image: string, index: number) => (
              <img
                key={index}
                src={image}
                alt={`${projectData.title} detail ${index + 1}`}
                className="w-full h-auto rounded-sm shadow-lg"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="bg-burgundy text-white py-16 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-playfair text-3xl font-bold mb-6">
            Ready to Create Your Own Custom Build?
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
            Contact our team to discuss your vision and begin your journey toward a bespoke restomod that exceeds your expectations.
          </p>
          <Link href="/#contact">
            <Button className="bg-white text-burgundy hover:bg-white/90 px-8 py-6 text-lg font-medium">
              Request a Consultation
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
