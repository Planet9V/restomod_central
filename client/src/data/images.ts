/**
 * Image configuration file for Skinny's Rod and Custom
 * This centralized file provides easy image management across the application
 */

// Vehicle image mapping
export const VehicleImages = {
  // Projects
  '1953-ford-f100': {
    main: 'https://images.unsplash.com/photo-1600881333168-2ef49b341f30?q=80&w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1600881333168-2ef49b341f30?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1669051066781-890031e8b72e?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1669051067274-2e1a51a1ad31?q=80&w=1600&auto=format&fit=crop',
    ]
  },
  '1967-ford-mustang': {
    main: 'https://images.unsplash.com/photo-1611016186353-9af58c69a533?q=80&w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1611016186353-9af58c69a533?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1533258439784-28006397342d?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1600&auto=format&fit=crop',
    ]
  },
  '1968-chevrolet-camaro': {
    main: 'https://images.unsplash.com/photo-1587825045776-39a3c73756b2?q=80&w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1587825045776-39a3c73756b2?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1588258119551-61a28978fb0d?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1565800080242-3a0e57a9b247?q=80&w=1600&auto=format&fit=crop',
    ]
  },
  '1966-chevrolet-chevelle': {
    main: 'https://images.unsplash.com/photo-1566889240303-a6075cb1575e?q=80&w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1566889240303-a6075cb1575e?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1614887871487-e2c4b3597c4c?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1564864701852-31020a56e057?q=80&w=1600&auto=format&fit=crop',
    ]
  },
  '1951-ford-f1': {
    main: 'https://images.unsplash.com/photo-1596649299486-4cdea56fd59d?q=80&w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1596649299486-4cdea56fd59d?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1596649299561-b0ca9e0dcb99?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1626286366886-727a49965d46?q=80&w=1600&auto=format&fit=crop',
    ]
  },
};

// Process section images
export const ProcessImages = {
  consultation: 'https://images.unsplash.com/photo-1600103862750-46102de8c2c5?q=80&w=1600&auto=format&fit=crop',
  design: 'https://images.unsplash.com/photo-1558389183-f54e139a4c6d?q=80&w=1600&auto=format&fit=crop',
  fabrication: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=1600&auto=format&fit=crop',
  finishing: 'https://images.unsplash.com/photo-1601055903647-ddf1ee9701b5?q=80&w=1600&auto=format&fit=crop'
};

// About section images
export const AboutImages = {
  skinnys: 'https://images.unsplash.com/photo-1559760434-0981df057e83?q=80&w=1600&auto=format&fit=crop',
  engineering: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=1600&auto=format&fit=crop'
};

// Team member images
export const TeamImages = {
  daveJohnson: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?q=80&w=300&auto=format&fit=crop',
  jamesMcKenney: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=300&auto=format&fit=crop',
  sarahChen: 'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=300&auto=format&fit=crop',
  mikeReyes: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop'
};

// Hero section image
export const HeroImage = 'https://images.unsplash.com/photo-1611566026373-c6c8da0945b8?q=80&w=2000&auto=format&fit=crop';

// Engineering section image
export const EngineeringImage = 'https://images.unsplash.com/photo-1591439657848-9f4b9ce3c97f?q=80&w=1600&auto=format&fit=crop';

// Default fallback image
export const FallbackImage = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1600&auto=format&fit=crop';

/**
 * Get the correct image for a vehicle by slug
 * @param slug The vehicle slug
 * @param type The image type (main or gallery)
 * @param index If gallery type, the index of the gallery image
 * @returns The image URL
 */
export function getVehicleImage(slug: string, type: 'main' | 'gallery' = 'main', index: number = 0): string {
  const vehicle = VehicleImages[slug];
  
  if (!vehicle) {
    console.warn(`No image configuration found for vehicle: ${slug}`);  
    return FallbackImage;
  }
  
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
