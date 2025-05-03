import { useQuery } from "@tanstack/react-query";
import SectionHeading from "@/components/ui/section-heading";
import TeamMemberCard from "@/components/ui/team-member-card";

const AboutUs = () => {
  const { data: aboutData } = useQuery({
    queryKey: ['/api/about'],
    staleTime: Infinity,
  });

  // Default data if API fails
  const companyInfo = aboutData?.companies || [
    {
      id: "skinnys",
      name: "Skinny's Rod and Custom",
      description: [
        "With over 25 years in the hot rod and custom car industry, Dave \"Skinny\" Johnson has built a reputation for exceptional craftsmanship and attention to detail.",
        "Skinny's team of artisans specializes in bodywork, fabrication, paint, and interior work that showcases the soul and character of classic vehicles while achieving concourse-level finishes."
      ],
      image: "https://images.unsplash.com/photo-1559760434-0981df057e83?q=80&w=1600&auto=format&fit=crop"
    },
    {
      id: "mckenney",
      name: "McKenney Engineering",
      description: [
        "Working in partnership with Skinny's, the McKenney Engineering division brings rigorous engineering principles to classic vehicle design.",
        "Their expertise in systems integration, performance optimization, and advanced CAD/CAM techniques ensures every vehicle performs as good as it looks."
      ],
      image: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=1600&auto=format&fit=crop"
    }
  ];

  const teamMembers = aboutData?.team || [
    {
      id: 2,
      name: "Dave \"Skinny\" Johnson",
      position: "Founder & Master Builder",
      image: "https://images.unsplash.com/photo-1566753323558-f4e0952af115?q=80&w=300&auto=format&fit=crop"
    },
    {
      id: 1,
      name: "James McKenney",
      position: "Engineering Director",
      image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=300&auto=format&fit=crop"
    },
    {
      id: 3,
      name: "Sarah Chen",
      position: "Systems Engineering Lead",
      image: "https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=300&auto=format&fit=crop"
    },
    {
      id: 4,
      name: "Mike Reyes",
      position: "Master Fabricator",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop"
    }
  ];

  return (
    <section id="about" className="py-24 bg-charcoal text-offwhite">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Our Story"
          description="Skinny's Rod and Custom has been delivering exceptional craftsmanship in hot rods, restoration and custom builds for over 25 years. We combine traditional techniques with modern engineering expertise to create truly exceptional vehicles."
        />
        
        <div className="grid md:grid-cols-2 gap-16">
          {companyInfo.map((company, index) => (
            <div key={company.id} className="reveal">
              <img
                src={company.image}
                alt={company.name}
                className="w-full h-auto rounded-sm shadow-lg mb-8"
              />
              <h3 className="font-playfair text-2xl font-medium mb-4">{company.name}</h3>
              {company.description.map((paragraph, i) => (
                <p key={i} className={i < company.description.length - 1 ? "text-offwhite/80 mb-4" : "text-offwhite/80"}>
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
        </div>
        
        <div className="mt-16 bg-charcoal/50 p-8 rounded-sm reveal">
          <h3 className="font-playfair text-2xl font-medium mb-6 text-center">Our Team</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                name={member.name}
                position={member.position}
                image={member.image}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
