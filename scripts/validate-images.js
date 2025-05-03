/**
 * Image URL validation script
 * This script checks all image URLs in the application to ensure they are valid
 */

import fetch from 'node-fetch';
import { readFile } from 'fs/promises';

// Function to extract image URLs from client/src/data/images.ts
async function extractImageUrls() {
  const data = await readFile('client/src/data/images.ts', 'utf8');
  
  // Use regex to extract all image URLs
  const urlRegex = /https:\/\/images\.unsplash\.com\/[\w\d\-\?\=\&\;\.\%\/_]+/g;
  return [...new Set(data.match(urlRegex) || [])];
}

// Main function
async function main() {
  // Extract all image URLs from the images.ts file
  console.log('Extracting image URLs from client/src/data/images.ts...');
  const uniqueImages = await extractImageUrls();
  console.log(`Found ${uniqueImages.length} unique image URLs.\n`);
  
  // Validate all extracted images
  const validationResults = await validateAllImages(uniqueImages);
  
  // Log a summary table of validation results
  console.log('\nImage Validation Summary:');
  console.log('-'.repeat(100));
  console.log('| Status | Image URL                                                      | Image Type      |');
  console.log('-'.repeat(100));
  
  validationResults.forEach(({url, isValid}) => {
    const status = isValid ? '✅ Valid' : '❌ Invalid';
    const type = getImageType(url);
    console.log(`| ${status.padEnd(8)} | ${url.substring(0, 60).padEnd(60)} | ${type.padEnd(15)} |`);
  });
  
  console.log('-'.repeat(100));
  
  return validationResults;
}

// Function to identify the type of image from its URL
function getImageType(url) {
  if (url.includes('photo-15')) return 'Car';
  if (url.includes('photo-16')) return 'Car Interior';
  if (url.includes('photo-17')) return 'Engine';
  if (url.includes('photo-18')) return 'Restoration';
  if (url.includes('photo-19')) return 'Workshop';
  if (url.includes('photo-15') && url.includes('truck')) return 'Truck';
  return 'Unknown';
}

// Function to check if an image URL is valid
async function checkImageUrl(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Check all images and report results
async function validateAllImages(imageUrls) {
  const results = [];
  let validCount = 0;
  let invalidCount = 0;
  
  console.log('Validating image URLs...');
  
  for (const url of imageUrls) {
    process.stdout.write(`Checking ${url.substring(0, 40)}... `);
    const isValid = await checkImageUrl(url);
    results.push({ url, isValid });
    
    if (isValid) {
      validCount++;
      process.stdout.write('✅\n');
    } else {
      invalidCount++;
      process.stdout.write('❌\n');
    }
  }
  
  console.log('\nResults:');
  console.log(`✅ Valid images: ${validCount}`);
  console.log(`❌ Invalid images: ${invalidCount}`);
  
  return results;
}

// Run the main function
main()
  .then(() => {
    console.log('Image validation complete.');
  })
  .catch(error => {
    console.error('Error during validation:', error);
  });
