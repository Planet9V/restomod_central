#!/usr/bin/env tsx
/**
 * Specification Validation Script
 *
 * Constitutional requirement: Ensures all active features have proper specifications
 * and that specifications meet the constitutional standards.
 *
 * This script is run as part of the build process to enforce spec-driven development.
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

interface SpecValidation {
  file: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface ValidationReport {
  totalSpecs: number;
  validSpecs: number;
  invalidSpecs: number;
  results: SpecValidation[];
  passed: boolean;
}

const REQUIRED_SECTIONS = [
  '## Overview',
  '## Requirements',
  '## Technical Design',
  '## Implementation Plan',
  '## Testing Strategy',
  '## Security Considerations',
  '## Performance Implications'
];

const SPEC_STATUSES = ['Draft', 'Under Review', 'Approved', 'Implemented'];

/**
 * Validates a single specification file
 */
function validateSpec(filePath: string): SpecValidation {
  const result: SpecValidation = {
    file: filePath,
    valid: true,
    errors: [],
    warnings: []
  };

  try {
    const content = readFileSync(filePath, 'utf-8');

    // Check for required sections
    for (const section of REQUIRED_SECTIONS) {
      if (!content.includes(section)) {
        result.errors.push(`Missing required section: ${section}`);
        result.valid = false;
      }
    }

    // Check for status declaration
    const statusMatch = content.match(/\*\*Status:\*\*\s*(.+)/);
    if (!statusMatch) {
      result.warnings.push('Status field not found');
    } else {
      const status = statusMatch[1].trim();
      const hasValidStatus = SPEC_STATUSES.some(s => status.includes(s));
      if (!hasValidStatus) {
        result.warnings.push(`Status "${status}" is not one of: ${SPEC_STATUSES.join(', ')}`);
      }
    }

    // Check for acceptance criteria
    if (!content.includes('### Acceptance Criteria')) {
      result.warnings.push('No acceptance criteria defined');
    }

    // Check for security considerations
    const securitySection = content.match(/## Security Considerations([\s\S]*?)##/);
    if (securitySection && securitySection[1].trim().length < 50) {
      result.warnings.push('Security considerations section appears too brief');
    }

    // Check for testing strategy
    const testingSection = content.match(/## Testing Strategy([\s\S]*?)##/);
    if (testingSection && testingSection[1].trim().length < 50) {
      result.warnings.push('Testing strategy section appears too brief');
    }

    // Check for performance implications
    const performanceSection = content.match(/## Performance Implications([\s\S]*?)##/);
    if (performanceSection && performanceSection[1].trim().length < 50) {
      result.warnings.push('Performance implications section appears too brief');
    }

  } catch (error) {
    result.errors.push(`Failed to read/parse file: ${error}`);
    result.valid = false;
  }

  return result;
}

/**
 * Validates all specifications in the specs directory
 */
function validateAllSpecs(): ValidationReport {
  const specsDir = join(process.cwd(), 'specs');

  if (!existsSync(specsDir)) {
    console.error('❌ Specs directory not found at:', specsDir);
    return {
      totalSpecs: 0,
      validSpecs: 0,
      invalidSpecs: 0,
      results: [],
      passed: false
    };
  }

  const files = readdirSync(specsDir)
    .filter(f => f.endsWith('-spec.md') && f !== 'TEMPLATE-spec.md')
    .map(f => join(specsDir, f));

  if (files.length === 0) {
    console.warn('⚠️  No specification files found in specs/ directory');
    console.warn('   Constitutional requirement: All features must have specifications');
    console.warn('   To create a spec: cp specs/TEMPLATE-spec.md specs/$(date +%Y-%m-%d)-feature-name-spec.md');
    return {
      totalSpecs: 0,
      validSpecs: 0,
      invalidSpecs: 0,
      results: [],
      passed: true // Allow builds when no specs exist yet (for initial setup)
    };
  }

  const results = files.map(validateSpec);
  const validSpecs = results.filter(r => r.valid).length;
  const invalidSpecs = results.filter(r => !r.valid).length;

  return {
    totalSpecs: files.length,
    validSpecs,
    invalidSpecs,
    results,
    passed: invalidSpecs === 0
  };
}

/**
 * Prints the validation report
 */
function printReport(report: ValidationReport): void {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 SPECIFICATION VALIDATION REPORT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`Total Specifications: ${report.totalSpecs}`);
  console.log(`✅ Valid: ${report.validSpecs}`);
  console.log(`❌ Invalid: ${report.invalidSpecs}\n`);

  if (report.results.length > 0) {
    for (const result of report.results) {
      const icon = result.valid ? '✅' : '❌';
      console.log(`${icon} ${result.file}`);

      if (result.errors.length > 0) {
        console.log('   Errors:');
        result.errors.forEach(err => console.log(`   ❌ ${err}`));
      }

      if (result.warnings.length > 0) {
        console.log('   Warnings:');
        result.warnings.forEach(warn => console.log(`   ⚠️  ${warn}`));
      }

      console.log('');
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (report.passed) {
    console.log('✅ SPECIFICATION VALIDATION PASSED');
  } else {
    console.log('❌ SPECIFICATION VALIDATION FAILED');
    console.log('\nConstitutional Requirement:');
    console.log('All specifications must be complete and valid.');
    console.log('Please fix the errors above before building.');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

/**
 * Main execution
 */
function main(): void {
  console.log('🔍 Validating specifications...\n');

  const report = validateAllSpecs();
  printReport(report);

  // Exit with appropriate code
  if (!report.passed) {
    process.exit(1);
  }
}

// Run main function
main();

export { validateAllSpecs, validateSpec, ValidationReport, SpecValidation };
