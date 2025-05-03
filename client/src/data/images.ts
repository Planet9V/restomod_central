/**
 * Image configuration file for Skinny's Rod and Custom
 * This centralized file provides easy image management across the application
 */

// Vehicle image mapping
export const VehicleImages = {
  // Projects
  '1953-ford-f100': {
    main: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541348263662-e068662d82af?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?q=80&w=1600&auto=format&fit=crop',
    ]
  },
  '1967-ford-mustang': {
    main: 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?q=80&w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1611016186353-9af58c69a533?q=80&w=1600&auto=format&fit=crop',
    ]
  },
  '1968-chevrolet-camaro': {
    main: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1600&auto=format&fit=crop',
    ]
  },
  '1966-chevrolet-chevelle': {
    main: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1600&auto=format&fit=crop',
    ]
  },
  '1951-ford-f1': {
    main: 'https://images.unsplash.com/photo-1596649299486-4cdea56fd59d?q=80&w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1596649299486-4cdea56fd59d?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534093607318-f025413f49cb?q=80&w=1600&auto=format&fit=crop',
    ]
  },
};

// Process section images
export const ProcessImages = {
  consultation: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1600&auto=format&fit=crop',
  design: 'https://images.unsplash.com/photo-1523726491678-bf852e717f6a?q=80&w=1600&auto=format&fit=crop',
  fabrication: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1600&auto=format&fit=crop',
  finishing: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600&auto=format&fit=crop'
};

// About section images
export const AboutImages = {
  skinnys: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1600&auto=format&fit=crop',
  engineering: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1600&auto=format&fit=crop'
};

// Team member images
export const TeamImages = {
  daveJohnson: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop',
  jamesMcKenney: 'https://images.unsplash.com/photo-1562788869-4ed32648eb72?q=80&w=300&auto=format&fit=crop',
  sarahChen: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop',
  mikeReyes: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop'
};

// Hero section image
export const HeroImage = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=2000&auto=format&fit=crop';

// Engineering section image
export const EngineeringImage = 'https://images.unsplash.com/photo-1599050751795-6cdaafbc2319?q=80&w=1600&auto=format&fit=crop';

// Default fallback image
export const FallbackImage = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1600&auto=format&fit=crop';

/**
 * Get the correct image for a vehicle by slug
 * @param slug The vehicle slug
 * @param type The image type (main or gallery)
 * @param index If gallery type, the index of the gallery image
 * @returns The image URL
 */
type VehicleSlug = keyof typeof VehicleImages;

export function getVehicleImage(slug: string, type: 'main' | 'gallery' = 'main', index: number = 0): string {
  // Check if the slug is valid
  if (!(slug in VehicleImages)) {
    console.warn(`No image configuration found for vehicle: ${slug}`);  
    return FallbackImage;
  }
  
  const vehicle = VehicleImages[slug as VehicleSlug];
  
  if (type === 'main') {
    return vehicle.main;
  }
  
  if (type === 'gallery' && vehicle.gallery && vehicle.gallery.length > index) {
    return vehicle.gallery[index];
  }
  
  return vehicle.main || FallbackImage;
}

/**
 * Get a process image by key
 * @param key The process key
 * @returns The image URL
 */
export function getProcessImage(key: 'consultation' | 'design' | 'fabrication' | 'finishing'): string {
  return ProcessImages[key] || FallbackImage;
}

/**
 * Get an about section image by key
 * @param key The about section key
 * @returns The image URL
 */
export function getAboutImage(key: 'skinnys' | 'engineering'): string {
  return AboutImages[key] || FallbackImage;
}

/**
 * Get a team member image by key
 * @param key The team member key
 * @returns The image URL
 */
export function getTeamImage(key: 'daveJohnson' | 'jamesMcKenney' | 'sarahChen' | 'mikeReyes'): string {
  return TeamImages[key] || FallbackImage;
}
