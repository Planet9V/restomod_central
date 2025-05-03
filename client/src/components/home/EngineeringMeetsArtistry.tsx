import SectionHeading from "@/components/ui/section-heading";
import FeatureBox from "@/components/ui/feature-box";
import { useQuery } from "@tanstack/react-query";
import { ENGINEERING_FEATURES } from "@/lib/constants";

const EngineeringMeetsArtistry = () => {
  const { data: engineeringData } = useQuery({
    queryKey: ['/api/engineering'],
    staleTime: Infinity,
  });

  // Use API data if available, fallback to constants
  const features = engineeringData?.features || ENGINEERING_FEATURES;
  const imageUrl = engineeringData?.imageUrl || "https://images.unsplash.com/photo-1583508805133-8fd01e208e57?q=80&w=1600&auto=format&fit=crop";
  const title = engineeringData?.title || "Craftsmanship Meets Technology";
  const description = engineeringData?.description || "At Skinny's Rod and Custom, we blend precision engineering with meticulous craftsmanship, backed by our McKenney Engineering division, creating vehicles that perform as brilliantly as they look.";

  return (
    <section className="py-24 bg-charcoal text-offwhite">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={title}
          description={description}
        />
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="reveal">
            <img
              src={imageUrl}
              alt="Car design engineering blueprint"
              className="w-full h-auto rounded-sm shadow-lg"
            />
          </div>
          <div className="space-y-8 reveal">
            {features.map((feature) => (
              <FeatureBox
                key={feature.id}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EngineeringMeetsArtistry;
