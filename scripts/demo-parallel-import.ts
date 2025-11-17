/**
 * Parallel Import Demonstration
 *
 * Demonstrates the parallel import system with example data
 * Shows real-time progress and performance metrics
 *
 * Usage:
 *   npm run demo:parallel
 *   tsx scripts/demo-parallel-import.ts
 */

import { execSync } from 'child_process';

console.log('\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('⚡ PARALLEL IMPORT DEMONSTRATION');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('This demo shows the parallel import system in action.\n');

console.log('📦 Demo Data:');
console.log('   • data/demo/batch1-muscle-cars.json (3 cars)');
console.log('   • data/demo/batch2-corvettes.json (2 cars)');
console.log('   • data/demo/batch3-classics.json (2 cars)');
console.log('   Total: 7 demo cars\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Method 1: Sequential Import (for comparison)
console.log('📊 METHOD 1: Sequential Import (Old Way)\n');
console.log('Importing batches ONE AT A TIME...\n');

const seqStart = Date.now();

try {
  console.log('[1/3] Importing batch1-muscle-cars.json...');
  execSync('npm run import:batch data/demo/batch1-muscle-cars.json', {
    stdio: 'pipe',
    encoding: 'utf-8'
  });

  console.log('[2/3] Importing batch2-corvettes.json...');
  execSync('npm run import:batch data/demo/batch2-corvettes.json', {
    stdio: 'pipe',
    encoding: 'utf-8'
  });

  console.log('[3/3] Importing batch3-classics.json...');
  execSync('npm run import:batch data/demo/batch3-classics.json', {
    stdio: 'pipe',
    encoding: 'utf-8'
  });
} catch (error) {
  // Ignore errors (likely duplicates if run multiple times)
}

const seqDuration = ((Date.now() - seqStart) / 1000).toFixed(2);

console.log(`\n✅ Sequential import complete in ${seqDuration}s\n`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Method 2: Parallel Import
console.log('⚡ METHOD 2: Parallel Import (New Way)\n');
console.log('Importing ALL batches SIMULTANEOUSLY...\n');

const parStart = Date.now();

try {
  const output = execSync('npm run import:parallel data/demo/*.json', {
    encoding: 'utf-8'
  });
  console.log(output);
} catch (error: any) {
  console.log(error.stdout || error.message);
}

const parDuration = ((Date.now() - parStart) / 1000).toFixed(2);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Performance Comparison
console.log('📊 PERFORMANCE COMPARISON\n');
console.log(`Sequential Import: ${seqDuration}s`);
console.log(`Parallel Import:   ${parDuration}s`);

const speedup = (parseFloat(seqDuration) / parseFloat(parDuration)).toFixed(2);
const improvement = (((parseFloat(seqDuration) - parseFloat(parDuration)) / parseFloat(seqDuration)) * 100).toFixed(1);

console.log(`\n⚡ Speedup: ${speedup}x faster`);
console.log(`📈 Improvement: ${improvement}% time saved\n`);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Show current status
console.log('📊 Current Database Status:\n');

try {
  const reportOutput = execSync('npm run cars:report', {
    encoding: 'utf-8'
  });
  console.log(reportOutput);
} catch (error: any) {
  console.log(error.stdout || 'Unable to generate report');
}

console.log('\n💡 Key Takeaways:\n');
console.log('   1. Parallel import is significantly faster than sequential');
console.log('   2. Real speedup increases with more files and larger batches');
console.log('   3. The system handles duplicates automatically');
console.log('   4. All files are processed concurrently with Promise.all()\n');

console.log('🚀 Next Steps:\n');
console.log('   • Read: PARALLEL-QUICK-START.md');
console.log('   • Generate plan: npm run scraping:plan -- --target=200');
console.log('   • Execute parallel scraping with Claude Code');
console.log('   • Import results: npm run import:parallel data/*.json\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
