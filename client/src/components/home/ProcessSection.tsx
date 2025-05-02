import { useQuery } from "@tanstack/react-query";
import SectionHeading from "@/components/ui/section-heading";
import ProcessStep from "@/components/ui/process-step";
import { PROCESS_STEPS } from "@/lib/constants";

const ProcessSection = () => {
  const { data: processData } = useQuery({
    queryKey: ['/api/process'],
    staleTime: Infinity,
  });

  // Use API data if available, otherwise use constants
  const steps = processData?.steps || PROCESS_STEPS;
  const warranty = processData?.warranty || {
    title: "Our Commitment to Quality",
    description: [
      "Every McKenney & Skinny's restomod is covered by our comprehensive 2-year warranty on craftsmanship and integration, with additional component warranties from our premium partners.",
      "Our support doesn't end at delivery — we provide ongoing maintenance, service, and advice to ensure your investment continues to perform flawlessly for years to come."
    ]
  };

  return (
    <section id="process" className="py-24 bg-charcoal text-offwhite">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Our Process"
          description="Transparency and collaboration drive our build process from initial consultation to delivery. Here's how we transform your vision into reality."
        />
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-burgundy hidden md:block"></div>
          
          {/* Process steps */}
          {steps.map((step, index) => (
            <ProcessStep
              key={step.id}
              step={step.id}
              title={step.title}
              description={step.description}
              image={step.image}
              alt={step.alt}
              isReversed={index % 2 !== 0}
            />
          ))}
        </div>
        
        {/* Warranty box */}
        <div className="bg-burgundy/10 border border-burgundy/20 p-8 mt-16 rounded-sm reveal">
          <h3 className="font-playfair text-xl font-medium mb-4">{warranty.title}</h3>
          {warranty.description.map((paragraph, index) => (
            <p key={index} className={index < warranty.description.length - 1 ? "mb-4" : ""}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
