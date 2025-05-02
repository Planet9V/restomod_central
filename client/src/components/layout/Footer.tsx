import { Link } from "wouter";
import { 
  SOCIAL_LINKS, 
  FOOTER_LINKS, 
  LEGAL_LINKS 
} from "@/lib/constants";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Instagram, Facebook, Youtube } from "lucide-react";

// Social media icon map
const SocialIcon = ({ name }: { name: string }) => {
  switch (name) {
    case 'Instagram':
      return <Instagram className="h-6 w-6" />;
    case 'Facebook':
      return <Facebook className="h-6 w-6" />;
    case 'YouTube':
      return <Youtube className="h-6 w-6" />;
    default:
      return null;
  }
};

const Footer = () => {
  const [email, setEmail] = useState("");
  
  const subscribeNewsletter = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest('POST', '/api/newsletter/subscribe', { email });
    },
    onSuccess: () => {
      setEmail("");
      // Could add toast notification here
      alert('Thank you for subscribing to our newsletter.');
    },
  });

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    subscribeNewsletter.mutate(email);
  };

  return (
    <footer className="bg-charcoal text-offwhite py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand section */}
          <div>
            <h4 className="font-playfair text-xl mb-6">McKenney & Skinny's</h4>
            <p className="text-offwhite/70 mb-6">
              Engineering meets artistry in every bespoke restomod we create.
            </p>
            <div className="flex space-x-4">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  className="text-offwhite/70 hover:text-gold transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{social.name}</span>
                  <SocialIcon name={social.name} />
                </a>
              ))}
            </div>
          </div>

          {/* Footer link sections */}
          {FOOTER_LINKS.map((section) => (
            <div key={section.title}>
              <h4 className="font-medium mb-6">{section.title}</h4>
              <ul className="space-y-3 text-offwhite/70">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="hover:text-gold transition-colors duration-200">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          {/* Newsletter section */}
          <div>
            <h4 className="font-medium mb-6">Newsletter</h4>
            <p className="text-offwhite/70 mb-4">
              Subscribe to our newsletter for the latest project updates and industry insights.
            </p>
            <form className="flex" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-2 bg-charcoal/50 border border-offwhite/20 focus:border-gold focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-burgundy hover:bg-burgundy/90 text-white px-4 py-2 transition-colors duration-200"
                disabled={subscribeNewsletter.isPending}
              >
                {subscribeNewsletter.isPending ? "..." : "Subscribe"}
              </button>
            </form>
          </div>
        </div>
        
        {/* Footer bottom */}
        <div className="border-t border-offwhite/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-offwhite/60 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} McKenney & Skinny's Bespoke Restomods. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-offwhite/60">
            {LEGAL_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="hover:text-gold transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
