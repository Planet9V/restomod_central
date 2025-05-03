/**
 * Image URL validation script
 * This script checks all image URLs in the application to ensure they are valid
 */

import fs from 'fs/promises';
import path from 'path';
import https from 'https';

/**
 * Extract all image URLs from images.ts file
 */
async function extractImageUrls() {
  try {
    const imagesFilePath = path.join(process.cwd(), '..', 'client/src/data/images.ts');
    const fileContent = await fs.readFile(imagesFilePath, 'utf-8');
    
    // Regular expression to find all Unsplash image URLs
    const urlRegex = /https:\/\/images\.unsplash\.com\/[^\s'"]+/g;
    const imageUrls = fileContent.match(urlRegex) || [];
    
    // Remove duplicates
    return [...new Set(imageUrls)];
  } catch (error) {
    console.error('Error during extraction:', error);
    return [];
  }
}

/**
 * Main function to validate all images
 */
async function main() {
  console.log('Extracting image URLs from client/src/data/images.ts...');
  
  try {
    const imageUrls = await extractImageUrls();
    console.log(`Found ${imageUrls.length} unique image URLs to validate.`);
    
    if (imageUrls.length === 0) {
      console.log('No image URLs found. Exiting.');
      process.exit(0);
    }
    
    const results = await validateAllImages(imageUrls);
    
    const validCount = results.filter(r => r.valid).length;
    const invalidCount = results.length - validCount;
    
    console.log('\nValidation Results:');
    console.log(`Total URLs: ${results.length}`);
    console.log(`Valid URLs: ${validCount}`);
    console.log(`Invalid URLs: ${invalidCount}`);
    
    if (invalidCount > 0) {
      console.log('\nInvalid URLs:');
      results.filter(r => !r.valid).forEach(result => {
        console.log(`- ${result.url} (${result.error || 'Unknown error'})`);
      });
    }
  } catch (error) {
    console.error('Error during validation:', error);
  }
}

/**
 * Determine the image type from URL
 */
function getImageType(url) {
  if (url.includes('photo-')) {
    const segments = url.split('/');
    const photoSegment = segments.find(s => s.startsWith('photo-'));
    if (photoSegment) {
      const idPart = photoSegment.split('-').pop();
      if (idPart && idPart.length >= 10) {
        return 'Unsplash';
      }
    }
  }
  return 'Unknown';
}

/**
 * Check if an image URL is valid by making a HEAD request
 */
async function checkImageUrl(url) {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      resolve({ url, valid: false, error: 'Request timeout' });
    }, 5000);
    
    const req = https.request(url, { method: 'HEAD' }, (res) => {
      clearTimeout(timeoutId);
      const statusCode = res.statusCode;
      const contentType = res.headers['content-type'] || '';
      const contentLength = res.headers['content-length'] || 0;
      
      if (statusCode >= 200 && statusCode < 300 && contentType.includes('image')) {
        resolve({ url, valid: true, contentType, contentLength });
      } else if (statusCode >= 300 && statusCode < 400 && res.headers.location) {
        // Follow redirects (maximum 1 level)
        checkImageUrl(res.headers.location).then(resolve);
      } else {
        resolve({
          url,
          valid: false,
          error: `Invalid response: status=${statusCode}, contentType=${contentType}`
        });
      }
    });
    
    req.on('error', (error) => {
      clearTimeout(timeoutId);
      resolve({ url, valid: false, error: error.message });
    });
    
    req.end();
  });
}

/**
 * Validate all image URLs in parallel with rate limiting
 */
async function validateAllImages(imageUrls) {
  const batchSize = 5; // Process 5 URLs at a time to avoid rate limiting
  const results = [];
  
  for (let i = 0; i < imageUrls.length; i += batchSize) {
    const batch = imageUrls.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(url => {
      console.log(`Checking: ${url}`);
      return checkImageUrl(url);
    }));
    
    results.push(...batchResults);
    
    // Wait a bit between batches to avoid rate limiting
    if (i + batchSize < imageUrls.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

// Run the validation
main();
