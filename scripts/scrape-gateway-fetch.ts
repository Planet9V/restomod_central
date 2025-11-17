import * as cheerio from 'cheerio';
import fs from 'fs';

async function scrapeGatewayClassicCars() {
  console.log('Fetching Gateway Classic Cars listings...');

  try {
    const url = 'https://www.gatewayclassiccars.com/vehicles';

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    console.log(`Fetched HTML (${html.length} bytes)`);

    // Save HTML for debugging
    fs.writeFileSync('/home/user/restomod_central/gateway-page.html', html);
    console.log('Saved HTML to gateway-page.html');

    // Parse with cheerio
    const $ = cheerio.load(html);
    const cars: any[] = [];
    const targetCount = 40;

    // Try to find vehicle listings
    console.log('Parsing HTML for vehicle listings...');

    // Try multiple selector patterns
    const selectors = [
      '.vehicle-card',
      '.inventory-item',
      '[class*="vehicle"]',
      '.car-card',
      '.listing',
      'a[href*="/vehicles/"]'
    ];

    let foundElements = false;
    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`Found ${elements.length} elements with selector: ${selector}`);
        foundElements = true;

        elements.each((i, elem) => {
          if (cars.length >= targetCount) return;

          try {
            const $elem = $(elem);

            // Extract link
            const link = $elem.is('a') ? $elem : $elem.find('a').first();
            const listingUrl = link.attr('href') || '';
            const fullUrl = listingUrl.startsWith('http') ? listingUrl : 'https://www.gatewayclassiccars.com' + listingUrl;

            if (!listingUrl.includes('vehicle')) return;

            // Extract stock number
            let stockNumber = '';
            const stockMatch = listingUrl.match(/\/vehicles?\/(\d+)/i) ||
                              listingUrl.match(/(\d{4,6})/);
            if (stockMatch) {
              stockNumber = 'GCC-' + stockMatch[1];
            }

            // Extract text content
            const text = $elem.text();

            // Extract year
            const yearMatch = text.match(/\b(19[2-9]\d|20[0-2]\d)\b/);
            const year = yearMatch ? parseInt(yearMatch[1]) : null;

            if (!year) return;

            // Extract title/make/model
            const title = $elem.find('h1, h2, h3, h4, [class*="title"]').first().text().trim() ||
                         link.text().trim();

            let make = '';
            let model = '';

            if (title) {
              const cleanTitle = title.replace(/\b19\d{2}\b|\b20\d{2}\b/g, '').trim();
              const parts = cleanTitle.split(/\s+/).filter(p => p.length > 0);
              if (parts.length >= 2) {
                make = parts[0];
                model = parts.slice(1).join(' ');
              } else if (parts.length === 1) {
                make = parts[0];
              }
            }

            // Extract price
            const priceElem = $elem.find('[class*="price"]').first();
            let price = 'Call for Price';
            if (priceElem.length) {
              const priceText = priceElem.text().trim();
              if (priceText && !priceText.toLowerCase().includes('call')) {
                price = priceText;
              }
            } else {
              const priceMatch = text.match(/\$[\d,]+/);
              if (priceMatch) {
                price = priceMatch[0];
              }
            }

            // Extract location
            const locationElem = $elem.find('[class*="location"]').first();
            const location = locationElem.text().trim() || '';

            // Dealer name
            const dealer = location ? `Gateway Classic Cars - ${location}` : 'Gateway Classic Cars';

            // Extract image
            const img = $elem.find('img').first();
            let imageUrl = img.attr('src') || img.attr('data-src') || '';
            if (imageUrl && imageUrl.startsWith('/')) {
              imageUrl = 'https://www.gatewayclassiccars.com' + imageUrl;
            }

            if (stockNumber && year) {
              cars.push({
                stockNumber,
                year,
                make: make || 'Unknown',
                model: model || 'Unknown',
                price,
                location,
                dealer,
                imageUrl,
                listingUrl: fullUrl
              });
            }
          } catch (err) {
            console.error('Error parsing element:', err);
          }
        });

        if (cars.length > 0) break;
      }
    }

    if (!foundElements) {
      console.log('No vehicle elements found with standard selectors');
      console.log('Checking for script tags with JSON data...');

      // Try to find JSON data in script tags
      $('script').each((i, script) => {
        const scriptContent = $(script).html() || '';
        if (scriptContent.includes('vehicle') || scriptContent.includes('inventory')) {
          console.log(`Found potential data in script tag ${i}`);
          // Try to extract JSON
          try {
            const jsonMatch = scriptContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const data = JSON.parse(jsonMatch[0]);
              console.log('Found JSON data:', Object.keys(data));
            }
          } catch (e) {
            // Not valid JSON, continue
          }
        }
      });
    }

    console.log(`\nExtracted ${cars.length} cars`);
    return cars.slice(0, targetCount);

  } catch (error) {
    console.error('Error during scraping:', error);
    throw error;
  }
}

// Run the scraper
scrapeGatewayClassicCars()
  .then(cars => {
    const outputPath = '/home/user/restomod_central/data/scraped-gateway-newest.json';
    fs.writeFileSync(outputPath, JSON.stringify(cars, null, 2));
    console.log(`\n✓ Saved ${cars.length} cars to ${outputPath}`);

    if (cars.length > 0) {
      console.log('\nSample data (first 2 cars):');
      console.log(JSON.stringify(cars.slice(0, 2), null, 2));

      console.log('\n=== SUMMARY ===');
      console.log(`Total scraped: ${cars.length} cars`);
      if (cars.length > 0) {
        const years = cars.map((c: any) => c.year).filter((y: any) => y);
        if (years.length > 0) {
          console.log(`Years range: ${Math.min(...years)} - ${Math.max(...years)}`);
        }
        console.log(`Unique makes: ${new Set(cars.map((c: any) => c.make)).size}`);
      }
    } else {
      console.log('\n⚠ No cars were extracted. Check gateway-page.html for debugging.');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
