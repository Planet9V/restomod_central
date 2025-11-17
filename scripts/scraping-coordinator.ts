/**
 * Scraping Coordinator - Parallel Multi-Source Scraping Manager
 *
 * Coordinates parallel scraping across multiple sources to maximize throughput
 *
 * This script generates scraping tasks that should be executed in parallel
 * by Claude Code using multiple Task tool calls
 *
 * Usage:
 *   tsx scripts/scraping-coordinator.ts --target=200 --sources=classiccars,hemmings
 */

interface ScrapingTask {
  id: string;
  source: string;
  url: string;
  description: string;
  targetCount: number;
  priority: number;
  outputFile: string;
  prompt: string;
}

interface CoordinatorConfig {
  target: number;
  sources: string[];
  parallelTasks: number;
}

const SCRAPING_TASKS: Record<string, ScrapingTask[]> = {
  classiccars: [
    {
      id: 'cc-muscle-60s',
      source: 'ClassicCars.com',
      url: 'https://classiccars.com/listings/find?year-min=1960&year-max=1969&category=muscle-cars&page=1',
      description: '1960s Muscle Cars',
      targetCount: 40,
      priority: 1,
      outputFile: 'data/scraped-cc-muscle-60s.json',
      prompt: `Use Playwright MCP to scrape ClassicCars.com muscle cars:

URL: https://classiccars.com/listings/find?year-min=1960&year-max=1969&category=muscle-cars

Extract 40 vehicles (2 pages, 20 per page).

For each vehicle, extract:
- stockNumber (from URL or listing ID)
- year (vehicle year)
- make (manufacturer)
- model (model name)
- price (asking price or "Call for Price")
- location (city, state - parse from location string)
- dealer (dealer name)
- imageUrl (main image URL)
- listingUrl (full URL to listing)

Return as JSON array. Example format:
[
  {
    "stockNumber": "CC-1234567",
    "year": 1967,
    "make": "Chevrolet",
    "model": "Camaro SS",
    "price": "$89,500",
    "location": "Phoenix, Arizona",
    "dealer": "Arizona Classic Cars",
    "imageUrl": "https://...",
    "listingUrl": "https://classiccars.com/listings/view/1234567"
  }
]

Navigate to page 2 and extract 20 more vehicles for a total of 40.`
    },
    {
      id: 'cc-corvettes',
      source: 'ClassicCars.com',
      url: 'https://classiccars.com/listings/find?make=chevrolet&model=corvette&page=1',
      description: 'Corvettes All Years',
      targetCount: 40,
      priority: 1,
      outputFile: 'data/scraped-cc-corvettes.json',
      prompt: `Use Playwright MCP to scrape ClassicCars.com Corvettes:

URL: https://classiccars.com/listings/find?make=chevrolet&model=corvette

Extract 40 Corvettes (2 pages).

Same fields as previous: stockNumber, year, make, model, price, location, dealer, imageUrl, listingUrl

Return as JSON array of 40 vehicles.`
    },
    {
      id: 'cc-mustangs',
      source: 'ClassicCars.com',
      url: 'https://classiccars.com/listings/find?make=ford&model=mustang&page=1',
      description: 'Mustangs All Years',
      targetCount: 40,
      priority: 1,
      outputFile: 'data/scraped-cc-mustangs.json',
      prompt: `Use Playwright MCP to scrape ClassicCars.com Mustangs:

URL: https://classiccars.com/listings/find?make=ford&model=mustang

Extract 40 Mustangs (2 pages).

Same fields: stockNumber, year, make, model, price, location, dealer, imageUrl, listingUrl

Return as JSON array of 40 vehicles.`
    },
    {
      id: 'cc-classics-50s',
      source: 'ClassicCars.com',
      url: 'https://classiccars.com/listings/find?year-min=1950&year-max=1959&page=1',
      description: '1950s Classics',
      targetCount: 40,
      priority: 2,
      outputFile: 'data/scraped-cc-classics-50s.json',
      prompt: `Use Playwright MCP to scrape ClassicCars.com 1950s classics:

URL: https://classiccars.com/listings/find?year-min=1950&year-max=1959

Extract 40 vehicles from the 1950s (2 pages).

Same fields: stockNumber, year, make, model, price, location, dealer, imageUrl, listingUrl

Return as JSON array of 40 vehicles.`
    }
  ],
  hemmings: [
    {
      id: 'hem-chevy',
      source: 'Hemmings.com',
      url: 'https://www.hemmings.com/classifieds?make=Chevrolet&year_range=1960-1980',
      description: 'Chevrolet 1960-1980',
      targetCount: 50,
      priority: 1,
      outputFile: 'data/scraped-hem-chevy.json',
      prompt: `Use Playwright MCP to scrape Hemmings Chevrolet listings:

URL: https://www.hemmings.com/classifieds?make=Chevrolet&year_range=1960-1980

Extract 50 Chevrolet vehicles from 1960-1980.

Fields: stockNumber, year, make, model, price, location, dealer, imageUrl, listingUrl

Return as JSON array of 50 vehicles.`
    },
    {
      id: 'hem-ford',
      source: 'Hemmings.com',
      url: 'https://www.hemmings.com/classifieds?make=Ford&year_range=1960-1980',
      description: 'Ford 1960-1980',
      targetCount: 50,
      priority: 1,
      outputFile: 'data/scraped-hem-ford.json',
      prompt: `Use Playwright MCP to scrape Hemmings Ford listings:

URL: https://www.hemmings.com/classifieds?make=Ford&year_range=1960-1980

Extract 50 Ford vehicles from 1960-1980.

Fields: stockNumber, year, make, model, price, location, dealer, imageUrl, listingUrl

Return as JSON array of 50 vehicles.`
    },
    {
      id: 'hem-dodge',
      source: 'Hemmings.com',
      url: 'https://www.hemmings.com/classifieds?make=Dodge&year_range=1965-1975',
      description: 'Dodge Muscle Era',
      targetCount: 40,
      priority: 2,
      outputFile: 'data/scraped-hem-dodge.json',
      prompt: `Use Playwright MCP to scrape Hemmings Dodge listings:

URL: https://www.hemmings.com/classifieds?make=Dodge&year_range=1965-1975

Extract 40 Dodge vehicles from muscle car era (1965-1975).

Fields: stockNumber, year, make, model, price, location, dealer, imageUrl, listingUrl

Return as JSON array of 40 vehicles.`
    }
  ],
  bringatrailer: [
    {
      id: 'bat-muscle',
      source: 'BringATrailer.com',
      url: 'https://bringatrailer.com/auctions/results/?q=muscle+car',
      description: 'Muscle Car Auctions',
      targetCount: 30,
      priority: 1,
      outputFile: 'data/scraped-bat-muscle.json',
      prompt: `Use Playwright MCP to scrape Bring a Trailer muscle car auctions:

URL: https://bringatrailer.com/auctions/results/?q=muscle+car

Extract 30 muscle car auction results (completed and active).

Fields: stockNumber (auction ID), year, make, model, price (sold price or current bid), location, imageUrl, listingUrl

Return as JSON array of 30 vehicles.`
    },
    {
      id: 'bat-corvettes',
      source: 'BringATrailer.com',
      url: 'https://bringatrailer.com/auctions/results/?q=corvette',
      description: 'Corvette Auctions',
      targetCount: 30,
      priority: 2,
      outputFile: 'data/scraped-bat-corvettes.json',
      prompt: `Use Playwright MCP to scrape Bring a Trailer Corvette auctions:

URL: https://bringatrailer.com/auctions/results/?q=corvette

Extract 30 Corvette auction results.

Fields: stockNumber, year, make, model, price, location, imageUrl, listingUrl

Return as JSON array of 30 vehicles.`
    }
  ]
};

function generateScrapingPlan(config: CoordinatorConfig): ScrapingTask[] {
  const tasks: ScrapingTask[] = [];

  // Collect tasks from requested sources
  for (const source of config.sources) {
    if (SCRAPING_TASKS[source]) {
      tasks.push(...SCRAPING_TASKS[source]);
    }
  }

  // Sort by priority
  tasks.sort((a, b) => a.priority - b.priority);

  // Calculate how many tasks we need to reach target
  let totalCount = 0;
  const selectedTasks: ScrapingTask[] = [];

  for (const task of tasks) {
    if (totalCount >= config.target) break;
    selectedTasks.push(task);
    totalCount += task.targetCount;
  }

  return selectedTasks;
}

function printScrapingPlan(tasks: ScrapingTask[]) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀  PARALLEL SCRAPING COORDINATOR');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const totalVehicles = tasks.reduce((sum, t) => sum + t.targetCount, 0);
  const sources = [...new Set(tasks.map(t => t.source))];

  console.log(`📊 Scraping Plan:`);
  console.log(`   Sources: ${sources.join(', ')}`);
  console.log(`   Tasks: ${tasks.length} parallel tasks`);
  console.log(`   Target: ${totalVehicles} vehicles total\n`);

  console.log(`📋 Tasks to Execute in Parallel:\n`);

  tasks.forEach((task, i) => {
    console.log(`${i + 1}. [${task.source}] ${task.description}`);
    console.log(`   URL: ${task.url}`);
    console.log(`   Target: ${task.targetCount} vehicles`);
    console.log(`   Output: ${task.outputFile}`);
    console.log(`   Priority: ${'⭐'.repeat(task.priority)}\n`);
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('⚡ EXECUTION INSTRUCTIONS:\n');
  console.log('To execute these tasks in PARALLEL with Claude Code:\n');

  console.log('1. Send a SINGLE message to Claude Code with ALL prompts:\n');
  console.log('```');
  console.log('I need you to scrape the following sources IN PARALLEL.');
  console.log('Use multiple Task tool calls in a SINGLE message.\n');
  console.log('Launch one task for each of these:\n');

  tasks.forEach((task, i) => {
    console.log(`Task ${i + 1}: ${task.description}`);
    console.log(`Save result to: ${task.outputFile}\n`);
  });

  console.log('```\n');

  console.log('2. Or copy each prompt separately (slower):\n');

  tasks.forEach((task, i) => {
    console.log(`━━ Task ${i + 1}: ${task.description} ━━`);
    console.log(task.prompt);
    console.log(`\nSave output to: ${task.outputFile}\n`);
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('3. After scraping, import all batches in parallel:\n');
  console.log('```bash');
  const outputFiles = tasks.map(t => t.outputFile).join(' ');
  console.log(`npm run import:parallel ${outputFiles}`);
  console.log('```\n');

  console.log('⚡ Estimated Time:');
  console.log(`   Sequential: ~${(tasks.length * 3).toFixed(0)} minutes (3 min/task)`);
  console.log(`   Parallel: ~${Math.max(3, tasks.length / 2).toFixed(0)} minutes (${tasks.length} tasks at once)`);
  console.log(`   Speedup: ${(tasks.length * 3 / Math.max(3, tasks.length / 2)).toFixed(1)}x faster\n`);

  console.log('📈 Expected Results:');
  console.log(`   Total vehicles: ${totalVehicles}`);
  console.log(`   New total (current 513 + ${totalVehicles}): ${513 + totalVehicles} / 1000`);
  console.log(`   Progress: ${((513 + totalVehicles) / 1000 * 100).toFixed(1)}%\n`);
}

// CLI
const args = process.argv.slice(2);
let target = 200;
let sources = ['classiccars', 'hemmings'];
let parallelTasks = 8;

for (const arg of args) {
  if (arg.startsWith('--target=')) {
    target = parseInt(arg.split('=')[1]);
  } else if (arg.startsWith('--sources=')) {
    sources = arg.split('=')[1].split(',');
  } else if (arg.startsWith('--parallel=')) {
    parallelTasks = parseInt(arg.split('=')[1]);
  }
}

const config: CoordinatorConfig = { target, sources, parallelTasks };
const tasks = generateScrapingPlan(config);

if (tasks.length === 0) {
  console.error('❌ No tasks generated. Check your sources.');
  console.log('\nAvailable sources: classiccars, hemmings, bringatrailer');
  console.log('\nUsage:');
  console.log('  tsx scripts/scraping-coordinator.ts --target=200 --sources=classiccars,hemmings');
  process.exit(1);
}

printScrapingPlan(tasks);

console.log('💡 Pro Tips:');
console.log('   • Use Task tool in Claude Code for true parallelization');
console.log('   • Save each scraped result to its designated output file');
console.log('   • Import all files at once with: npm run import:parallel data/*.json');
console.log('   • Check progress with: npm run cars:report\n');
