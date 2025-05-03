/**
 * Image configuration file for Skinny's Rod and Custom
 * This centralized file provides easy image management across the application
 */

// Vehicle image mapping
export const VehicleImages = {
  // Projects
  '1953-ford-f100': {
    main: 'https://images.unsplash.com/photo-1561694748-bca86b1ac585?q=80&w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1561694748-bca86b1ac585?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1569013389100-08ba362908e5?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1531086623190-a3bd615e55b5?q=80&w=1600&auto=format&fit=crop',
    ]
  },
  '1967-ford-mustang': {
    main: 'https://images.unsplash.com/photo-1588127333419-b9d7de223dcf?q=80&w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1588127333419-b9d7de223dcf?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583267746897-2cf66319ef97?q=80&w=1600&auto=format&fit=crop',
    ]
  },
  '1968-chevrolet-camaro': {
    main: 'https://images.unsplash.com/photo-1587825045776-39a3c73756b2?q=80&w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1587825045776-39a3c73756b2?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1603386329225-868361163bbe?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1565043589224-4d1b8b0dd85f?q=80&w=1600&auto=format&fit=crop',
    ]
  },
  '1966-chevrolet-chevelle': {
    main: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566889240233-fe8e57d3df9e?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544407160-0a2b8f616b8a?q=80&w=1600&auto=format&fit=crop',
    ]
  },
  '1951-ford-f1': {
    main: 'https://images.unsplash.com/photo-1591194693359-0f89ed5569a2?q=80&w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1591194693359-0f89ed5569a2?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1603385020333-d50650fa0d3e?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1578209258428-5a5e455c8d69?q=80&w=1600&auto=format&fit=crop',
    ]
  },
};

// Process section images
export const ProcessImages = {
  consultation: 'https://images.unsplash.com/photo-1577412647305-991150c7d163?q=80&w=1600&auto=format&fit=crop',
  design: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1600&auto=format&fit=crop',
  fabrication: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=1600&auto=format&fit=crop',
  finishing: 'https://images.unsplash.com/photo-1594818379496-da1e345d0ded?q=80&w=1600&auto=format&fit=crop'
};

// About section images
export const AboutImages = {
  skinnys: 'https://images.unsplash.com/photo-1504222490345-c075b6008014?q=80&w=1600&auto=format&fit=crop',
  engineering: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1600&auto=format&fit=crop'
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
