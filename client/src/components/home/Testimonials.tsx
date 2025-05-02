import { useQuery } from "@tanstack/react-query";
import SectionHeading from "@/components/ui/section-heading";
import TestimonialCard from "@/components/ui/testimonial-card";

const Testimonials = () => {
  const { data: testimonialsData } = useQuery({
    queryKey: ['/api/testimonials'],
    staleTime: Infinity,
  });

  // Default data if API fails
  const testimonials = testimonialsData?.testimonials || [
    {
      id: 1,
      quote: "The attention to detail and engineering excellence that McKenney & Skinny's put into my '67 Mustang exceeded all expectations. It's the perfect blend of classic style and modern performance.",
      authorName: "Robert Maxwell",
      authorLocation: "Portland, Oregon",
      authorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop"
    },
    {
      id: 2,
      quote: "After researching numerous builders, I chose McKenney & Skinny's for their transparent process and engineering-first approach. They transformed my Bronco into the perfect weekend adventure vehicle.",
      authorName: "Jennifer Harmon",
      authorLocation: "Austin, Texas",
      authorImage: "https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?q=80&w=200&auto=format&fit=crop"
    },
    {
      id: 3,
      quote: "The level of communication and collaboration throughout the build was exceptional. They made my vision for a modern classic Porsche 911 a reality, with performance that rivals modern sports cars.",
      authorName: "David Kawecki",
      authorLocation: "Chicago, Illinois",
      authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
    }
  ];

  return (
    <section className="py-24 bg-burgundy text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Client Experiences"
          description="Our clients share their journeys and experiences with McKenney & Skinny's bespoke restomods."
        />
        
        <div className="grid md:grid-cols-3 gap-8 reveal">
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              quote={testimonial.quote}
              authorName={testimonial.authorName}
              authorLocation={testimonial.authorLocation}
              authorImage={testimonial.authorImage}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
