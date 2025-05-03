import { VehicleImages, ProcessImages, AboutImages, TeamImages, FallbackImage } from '@/data/images';

// Define types based on the image configuration
type VehicleSlug = keyof typeof VehicleImages;
type ProcessKey = keyof typeof ProcessImages;
type AboutKey = keyof typeof AboutImages;
type TeamMemberKey = keyof typeof TeamImages;

// Project interface - use a minimal version of what we need
interface ProjectWithImages {
  slug?: string;
  imageUrl?: string;
  galleryImages?: string[];
  [key: string]: any; // Allow other properties
}

/**
 * Image Service for Skinny's Rod and Custom
 * Provides methods to get images for various parts of the application
 */
class ImageService {
  /**
   * Updates a database-sourced project object with corrected images
   * @param project The project object from the database
   * @returns Project with updated images
   */
  updateProjectImages(project: any): any {
    if (!project) return project;
    
    // Return early if there's no slug
    if (!project.slug) return project;
    
    const vehicleConfig = VehicleImages[project.slug];
    if (!vehicleConfig) return project;
    
    // Create a new object to avoid mutating the original
    return {
      ...project,
      imageUrl: vehicleConfig.main || project.imageUrl,
      galleryImages: vehicleConfig.gallery || project.galleryImages
    };
  }
  
  /**
   * Updates an array of projects with corrected images
   * @param projects Array of projects from the database
   * @returns Array of projects with updated images
   */
  updateProjectsImages(projects: any[]): any[] {
    if (!projects || !Array.isArray(projects)) return projects;
    
    return projects.map(project => this.updateProjectImages(project));
  }
  
  /**
   * Get the main image for a vehicle
   * @param slug The vehicle slug
   * @returns Main image URL
   */
  getVehicleMainImage(slug: string): string {
    const vehicle = VehicleImages[slug];
    return vehicle?.main || FallbackImage;
  }
  
  /**
   * Get the gallery images for a vehicle
   * @param slug The vehicle slug
   * @returns Array of gallery image URLs
   */
  getVehicleGalleryImages(slug: string): string[] {
    const vehicle = VehicleImages[slug];
    return vehicle?.gallery || [FallbackImage];
  }
  
  /**
   * Get a process step image
   * @param step The process step (consultation, design, fabrication, finishing)
   * @returns Process step image URL
   */
  getProcessImage(step: string): string {
    const normalizedStep = step.toLowerCase();
    
    if (normalizedStep.includes('consult')) return ProcessImages.consultation;
    if (normalizedStep.includes('design') || normalizedStep.includes('engineer')) return ProcessImages.design;
    if (normalizedStep.includes('fabric') || normalizedStep.includes('assembl')) return ProcessImages.fabrication;
    if (normalizedStep.includes('finish') || normalizedStep.includes('deliver')) return ProcessImages.finishing;
    
    return FallbackImage;
  }
  
  /**
   * Get an about section image
   * @param company The company name
   * @returns Company image URL
   */
  getAboutImage(company: string): string {
    const normalizedName = company.toLowerCase();
    
    if (normalizedName.includes('skinny')) return AboutImages.skinnys;
    if (normalizedName.includes('mckenney') || normalizedName.includes('engineer')) return AboutImages.engineering;
    
    return FallbackImage;
  }
  
  /**
   * Get a team member image by name
   * @param name The team member's name
   * @returns Team member image URL
   */
  getTeamMemberImage(name: string): string {
    const normalizedName = name.toLowerCase();
    
    if (normalizedName.includes('dave') || normalizedName.includes('skinny')) return TeamImages.daveJohnson;
    if (normalizedName.includes('james') || normalizedName.includes('mckenney')) return TeamImages.jamesMcKenney;
    if (normalizedName.includes('sarah') || normalizedName.includes('chen')) return TeamImages.sarahChen;
    if (normalizedName.includes('mike') || normalizedName.includes('reyes')) return TeamImages.mikeReyes;
    
    return FallbackImage;
  }
}

// Export a singleton instance
export const imageService = new ImageService();
