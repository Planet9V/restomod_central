/**
 * Fallback image library for car configurator
 * These URLs represent high-quality images of classic cars and parts
 * to be used when AI image generation is not available
 */

// Collection of vetted classic car images from public domains
export const carImages: Record<string, string[]> = {
  "1967 Ford Mustang": [
    "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=1200&auto=format&fit=crop", 
    "https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1662074819661-d941775aafdf?w=1200&auto=format&fit=crop"
  ],
  "1969 Chevrolet Camaro": [
    "https://images.unsplash.com/photo-1603553329474-99f95f35394f?w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1612477512956-17915157c6ac?w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1591105327764-cfc76c183e31?w=1200&auto=format&fit=crop"
  ],
  "1965 Shelby Cobra": [
    "https://images.unsplash.com/photo-1625766327130-6dca50a59674?w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1597687210367-04dd2ef406ad?w=1200&auto=format&fit=crop"
  ],
  "1970 Dodge Charger": [
    "https://images.unsplash.com/photo-1569171206684-dfb2749d96fd?w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1611821064430-0d40291ac024?w=1200&auto=format&fit=crop"
  ],
  "1953 Ford F100": [
    "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1531086623190-a3bd615e55b5?w=1200&auto=format&fit=crop"
  ],
  "1957 Chevrolet Bel Air": [
    "https://images.unsplash.com/photo-1626142518657-7f3f336b2cec?w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1626190304027-3ac12ebafc81?w=1200&auto=format&fit=crop"
  ],
  "1969 Ford Mustang Fastback": [
    "https://images.unsplash.com/photo-1603553329474-99f95f35394f?w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1610844834548-2231f882e636?w=1200&auto=format&fit=crop"
  ]
};

// Collection of vetted car parts images
export const partImages: Record<string, string[]> = {
  "Engine": [
    "https://images.unsplash.com/photo-1635518425536-56e4ee38d30c?w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop"
  ],
  "Transmission": [
    "https://images.unsplash.com/photo-1633382522397-6e2b0b911f5d?w=1200&auto=format&fit=crop"
  ],
  "Suspension": [
    "https://images.unsplash.com/photo-1629207856268-0f3a029cc376?w=1200&auto=format&fit=crop"
  ],
  "Brakes": [
    "https://images.unsplash.com/photo-1578232663042-b648102f7378?w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1623981566040-f2858922aceE?w=1200&auto=format&fit=crop"
  ],
  "Wheels": [
    "https://images.unsplash.com/photo-1525328302834-e5cb20593422?w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1573577425778-75eeb5b01d8d?w=1200&auto=format&fit=crop"
  ],
  "Interior": [
    "https://images.unsplash.com/photo-1622152802481-df5afb0a5735?w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511508411044-56e7a3c6947f?w=1200&auto=format&fit=crop"
  ],
  "Exhaust": [
    "https://images.unsplash.com/photo-1621963563999-3b99f0dbc678?w=1200&auto=format&fit=crop"
  ],
  "Seats": [
    "https://images.unsplash.com/photo-1600794954488-9042ba976a35?w=1200&auto=format&fit=crop"
  ]
};

/**
 * Get a fallback image for a car model
 * @param carModel The car model name
 * @returns URL to a high-quality image of the car
 */
export function getCarImage(carModel: string): string {
  // Try to find exact match
  if (carImages[carModel] && carImages[carModel].length > 0) {
    const randomIndex = Math.floor(Math.random() * carImages[carModel].length);
    return carImages[carModel][randomIndex];
  }
  
  // Try to find partial match
  const lowerCaseModel = carModel.toLowerCase();
  const matchingKey = Object.keys(carImages).find(key => 
    lowerCaseModel.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerCaseModel)
  );
  
  if (matchingKey && carImages[matchingKey].length > 0) {
    const randomIndex = Math.floor(Math.random() * carImages[matchingKey].length);
    return carImages[matchingKey][randomIndex];
  }
  
  // Return general classic car image if no matches
  const allImages = Object.values(carImages).flat();
  const randomIndex = Math.floor(Math.random() * allImages.length);
  return allImages[randomIndex];
}

/**
 * Get a fallback image for a car part
 * @param partName The part name
 * @returns URL to a high-quality image of the part
 */
export function getPartImage(partName: string): string {
  // Try to find exact match
  if (partImages[partName] && partImages[partName].length > 0) {
    const randomIndex = Math.floor(Math.random() * partImages[partName].length);
    return partImages[partName][randomIndex];
  }
  
  // Try to find partial match
  const lowerCasePart = partName.toLowerCase();
  const matchingKey = Object.keys(partImages).find(key => 
    lowerCasePart.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerCasePart)
  );
  
  if (matchingKey && partImages[matchingKey].length > 0) {
    const randomIndex = Math.floor(Math.random() * partImages[matchingKey].length);
    return partImages[matchingKey][randomIndex];
  }
  
  // Return general part image if no matches
  const allImages = Object.values(partImages).flat();
  const randomIndex = Math.floor(Math.random() * allImages.length);
  return allImages[randomIndex];
}