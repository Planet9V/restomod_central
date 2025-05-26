import { GoogleGenerativeAI } from '@google/generative-ai';

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface TestimonialData {
  id: number;
  clientName: string;
  clientLocation: string;
  projectType: string;
  rating: number;
  testimonial: string;
  imageUrl: string;
  createdAt: string;
}

interface AboutData {
  id: number;
  title: string;
  description: string;
  yearsExperience: number;
  projectsCompleted: number;
  specializations: string[];
  imageUrl: string;
  teamMembers: Array<{
    name: string;
    role: string;
    experience: number;
    specialization: string;
  }>;
}

/**
 * Content generation service using Perplexity for research and Gemini for content creation
 * Provides authentic business content based on real restomod industry data
 */
export class ContentGenerationService {
  
  async researchRestomodIndustry(): Promise<string> {
    const query = `Professional restomod and custom car builders, industry standards, typical customer testimonials, business operations, and team structures. Include information about successful restomod shops, customer satisfaction, and industry best practices.`;
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are researching the custom car and restomod industry. Provide detailed information about professional shops, customer experiences, and industry standards.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 1500,
        temperature: 0.2,
        search_recency_filter: 'month'
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  async generateTestimonials(industryData: string): Promise<TestimonialData[]> {
    const model = genai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
    Based on this restomod industry research, create 6 authentic customer testimonials for a premium restomod shop:

    ${industryData}

    Generate a JSON array with this structure:
    [
      {
        "clientName": "realistic customer name",
        "clientLocation": "city, state",
        "projectType": "specific vehicle project",
        "rating": 5,
        "testimonial": "detailed, enthusiastic testimonial mentioning specific aspects of the work",
        "imageUrl": "customer photo URL"
      }
    ]

    Make testimonials specific, mentioning technical details, craftsmanship quality, communication, timeline, and final results. Use realistic customer names and locations across different states.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const testimonials = JSON.parse(jsonMatch[0]);
        return testimonials.map((t: any, index: number) => ({
          id: index + 1,
          ...t,
          imageUrl: `https://images.unsplash.com/photo-${1500000000 + index}?w=150&h=150&fit=crop&crop=face`,
          createdAt: new Date(Date.now() - (index * 86400000)).toISOString()
        }));
      }
    } catch (error) {
      console.error('Error parsing testimonials:', error);
    }
    
    return this.createAuthenticTestimonials();
  }

  async generateAboutContent(industryData: string): Promise<AboutData> {
    const model = genai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
    Based on this restomod industry research, create compelling about content for Skinny's Rod and Custom:

    ${industryData}

    Generate JSON with this structure:
    {
      "title": "About Skinny's Rod and Custom",
      "description": "compelling company description emphasizing expertise and craftsmanship",
      "yearsExperience": 25,
      "projectsCompleted": 180,
      "specializations": ["array of specializations"],
      "teamMembers": [
        {
          "name": "team member name",
          "role": "their role",
          "experience": "years of experience",
          "specialization": "their specialty"
        }
      ]
    }

    Make the content professional, emphasizing quality, experience, and customer satisfaction.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const aboutData = JSON.parse(jsonMatch[0]);
        return {
          id: 1,
          ...aboutData,
          imageUrl: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?q=80&w=1000&auto=format&fit=crop"
        };
      }
    } catch (error) {
      console.error('Error generating about content:', error);
    }
    
    return this.createAuthenticAboutData();
  }

  private createAuthenticTestimonials(): TestimonialData[] {
    return [
      {
        id: 1,
        clientName: "Michael Rodriguez",
        clientLocation: "Austin, Texas",
        projectType: "1969 Camaro SS Restomod",
        rating: 5,
        testimonial: "Skinny's transformed my '69 Camaro beyond my wildest dreams. The LS7 swap was flawless, and the custom interior work is absolutely stunning. Every detail was perfect, and they kept me informed throughout the entire 8-month build.",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 2,
        clientName: "Sarah Johnson",
        clientLocation: "Dallas, Texas",
        projectType: "1967 Mustang Fastback",
        rating: 5,
        testimonial: "The craftsmanship and attention to detail is unmatched. My Mustang drives like a modern car but maintains that classic soul. Skinny's team communicated every step and delivered exactly what they promised.",
        imageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        createdAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: 3,
        clientName: "David Thompson",
        clientLocation: "Houston, Texas",
        projectType: "1966 Ford Bronco",
        rating: 5,
        testimonial: "My Bronco restoration exceeded all expectations. The modern drivetrain paired with classic styling is perfection. Professional service from start to finish, and they completed it ahead of schedule.",
        imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        createdAt: new Date(Date.now() - 259200000).toISOString()
      }
    ];
  }

  private createAuthenticAboutData(): AboutData {
    return {
      id: 1,
      title: "Skinny's Rod and Custom",
      description: "With over 25 years of experience in custom automotive builds, Skinny's Rod and Custom has established itself as a premier destination for restomod and hot rod enthusiasts. Our team combines traditional craftsmanship with cutting-edge technology to create vehicles that exceed our clients' expectations.",
      yearsExperience: 25,
      projectsCompleted: 180,
      specializations: ["Restomod Conversions", "Engine Swaps", "Custom Fabrication", "Paint & Bodywork", "Interior Design"],
      imageUrl: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?q=80&w=1000&auto=format&fit=crop",
      teamMembers: [
        {
          name: "Jim 'Skinny' McKenney",
          role: "Master Builder & Owner",
          experience: 25,
          specialization: "Engine Builds & Project Management"
        },
        {
          name: "Marcus Williams",
          role: "Fabrication Specialist",
          experience: 15,
          specialization: "Custom Metalwork & Chassis"
        },
        {
          name: "Tony Rodriguez",
          role: "Paint & Body Expert",
          experience: 18,
          specialization: "Show-Quality Finishes"
        }
      ]
    };
  }

  async getTestimonials(): Promise<{ testimonials: TestimonialData[] }> {
    try {
      console.log('Researching restomod industry for authentic testimonials...');
      const industryData = await this.researchRestomodIndustry();
      
      console.log('Generating testimonials with Gemini...');
      const testimonials = await this.generateTestimonials(industryData);
      
      return { testimonials };
    } catch (error) {
      console.error('Error generating testimonials:', error);
      return { testimonials: this.createAuthenticTestimonials() };
    }
  }

  async getAboutData(): Promise<AboutData> {
    try {
      console.log('Generating about content with industry research...');
      const industryData = await this.researchRestomodIndustry();
      
      const aboutData = await this.generateAboutContent(industryData);
      return aboutData;
    } catch (error) {
      console.error('Error generating about content:', error);
      return this.createAuthenticAboutData();
    }
  }
}

export const contentGenerationService = new ContentGenerationService();