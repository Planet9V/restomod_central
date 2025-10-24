/**
 * Phase 5 Data Population: Event-Vehicle Cross-Linking
 * Parses event names and categories to populate vehicle makes/models
 */

import { db } from '../db';
import { carShowEvents } from '../shared/schema';
import { eq } from 'drizzle-orm';

interface VehicleFocus {
  vehicleMakes: string[];
  vehicleModels: string[];
  primaryVehicleFocus: 'make' | 'model' | 'category' | 'era' | 'general';
  expectedAttendanceMin: number;
  expectedAttendanceMax: number;
}

/**
 * Parse event name and category to determine vehicle focus
 */
function parseEventForVehicles(eventName: string, eventCategory: string | null, eventType: string): VehicleFocus {
  const nameLower = eventName.toLowerCase();
  const makes: string[] = [];
  const models: string[] = [];
  let primaryFocus: VehicleFocus['primaryVehicleFocus'] = 'general';

  // Specific Model Focus
  if (nameLower.includes('mustang')) {
    makes.push('Ford');
    models.push('Mustang');
    primaryFocus = 'model';
  }
  if (nameLower.includes('corvette')) {
    makes.push('Chevrolet');
    models.push('Corvette');
    primaryFocus = 'model';
  }
  if (nameLower.includes('camaro')) {
    makes.push('Chevrolet');
    models.push('Camaro');
    primaryFocus = 'model';
  }
  if (nameLower.includes('charger') || nameLower.includes('challenger')) {
    makes.push('Dodge');
    if (nameLower.includes('charger')) models.push('Charger');
    if (nameLower.includes('challenger')) models.push('Challenger');
    primaryFocus = 'model';
  }
  if (nameLower.includes('gto')) {
    makes.push('Pontiac');
    models.push('GTO');
    primaryFocus = 'model';
  }
  if (nameLower.includes('thunderbird') || nameLower.includes('t-bird')) {
    makes.push('Ford');
    models.push('Thunderbird');
    primaryFocus = 'model';
  }
  if (nameLower.includes('impala')) {
    makes.push('Chevrolet');
    models.push('Impala');
    primaryFocus = 'model';
  }
  if (nameLower.includes('nova')) {
    makes.push('Chevrolet');
    models.push('Nova');
    primaryFocus = 'model';
  }

  // Make-Specific Events
  if (nameLower.includes('ford') && !makes.includes('Ford')) {
    makes.push('Ford');
    if (primaryFocus === 'general') primaryFocus = 'make';
  }
  if ((nameLower.includes('chevy') || nameLower.includes('chevrolet')) && !makes.includes('Chevrolet')) {
    makes.push('Chevrolet');
    if (primaryFocus === 'general') primaryFocus = 'make';
  }
  if ((nameLower.includes('dodge') || nameLower.includes('mopar')) && !makes.includes('Dodge')) {
    makes.push('Dodge');
    if (nameLower.includes('mopar')) {
      makes.push('Plymouth', 'Chrysler');
    }
    if (primaryFocus === 'general') primaryFocus = 'make';
  }
  if (nameLower.includes('pontiac') && !makes.includes('Pontiac')) {
    makes.push('Pontiac');
    if (primaryFocus === 'general') primaryFocus = 'make';
  }
  if (nameLower.includes('buick') && !makes.includes('Buick')) {
    makes.push('Buick');
    if (primaryFocus === 'general') primaryFocus = 'make';
  }
  if (nameLower.includes('oldsmobile') && !makes.includes('Oldsmobile')) {
    makes.push('Oldsmobile');
    if (primaryFocus === 'general') primaryFocus = 'make';
  }

  // Category-Based Focus
  if (makes.length === 0 && eventCategory) {
    primaryFocus = 'category';

    switch (eventCategory) {
      case 'muscle':
        makes.push('Chevrolet', 'Ford', 'Dodge', 'Pontiac', 'Plymouth');
        models.push('Camaro', 'Chevelle', 'Mustang', 'Charger', 'Challenger', 'GTO', 'Road Runner');
        break;
      case 'classic':
        makes.push('Chevrolet', 'Ford', 'Dodge', 'Pontiac', 'Buick', 'Oldsmobile', 'Plymouth');
        break;
      case 'hot_rod':
        makes.push('Ford', 'Chevrolet', 'Dodge', 'Plymouth');
        primaryFocus = 'era';
        break;
      case 'exotic':
        makes.push('Ferrari', 'Lamborghini', 'Porsche', 'Aston Martin', 'Maserati');
        break;
      case 'vintage':
        makes.push('Ford', 'Chevrolet', 'Dodge', 'Packard', 'Studebaker');
        primaryFocus = 'era';
        break;
      case 'street_machine':
        makes.push('Chevrolet', 'Ford', 'Dodge');
        break;
    }
  }

  // Era-Based Events
  if (nameLower.includes('50s') || nameLower.includes('fifties') || nameLower.includes('1950')) {
    primaryFocus = 'era';
    if (makes.length === 0) {
      makes.push('Chevrolet', 'Ford', 'Mercury', 'Pontiac', 'Buick');
    }
  }
  if (nameLower.includes('60s') || nameLower.includes('sixties') || nameLower.includes('1960')) {
    primaryFocus = 'era';
    if (makes.length === 0) {
      makes.push('Chevrolet', 'Ford', 'Dodge', 'Pontiac', 'Plymouth');
    }
  }
  if (nameLower.includes('70s') || nameLower.includes('seventies') || nameLower.includes('1970')) {
    primaryFocus = 'era';
    if (makes.length === 0) {
      makes.push('Chevrolet', 'Ford', 'Dodge', 'Pontiac', 'AMC');
    }
  }

  // Hot Rod specific
  if (nameLower.includes('hot rod') || nameLower.includes('street rod')) {
    if (makes.length === 0) {
      makes.push('Ford', 'Chevrolet', 'Dodge');
    }
    if (primaryFocus === 'general') primaryFocus = 'category';
  }

  // Estimate attendance based on event type and name patterns
  let minAttendance = 100;
  let maxAttendance = 500;

  // Event type modifiers
  switch (eventType) {
    case 'cruise_in':
      minAttendance = 50;
      maxAttendance = 300;
      break;
    case 'car_show':
      minAttendance = 200;
      maxAttendance = 2000;
      break;
    case 'concours':
      minAttendance = 100;
      maxAttendance = 1000;
      break;
    case 'auction':
      minAttendance = 500;
      maxAttendance = 5000;
      break;
    case 'swap_meet':
      minAttendance = 300;
      maxAttendance = 3000;
      break;
  }

  // Name-based modifiers (large/national events)
  if (nameLower.includes('nationals') || nameLower.includes('national')) {
    minAttendance = 3000;
    maxAttendance = 15000;
  } else if (nameLower.includes('regional') || nameLower.includes('round-up')) {
    minAttendance = 1000;
    maxAttendance = 5000;
  } else if (nameLower.includes('annual') || nameLower.includes('classic')) {
    minAttendance = Math.max(minAttendance, 500);
    maxAttendance = Math.max(maxAttendance, 2000);
  } else if (nameLower.includes('cruise') || nameLower.includes('meet')) {
    minAttendance = Math.min(minAttendance, 200);
    maxAttendance = Math.min(maxAttendance, 1000);
  }

  // Model-specific events tend to draw larger crowds
  if (primaryFocus === 'model') {
    minAttendance = Math.max(minAttendance, 500);
    maxAttendance = Math.max(maxAttendance, 2000);
  }

  return {
    vehicleMakes: [...new Set(makes)], // Remove duplicates
    vehicleModels: [...new Set(models)],
    primaryVehicleFocus: primaryFocus,
    expectedAttendanceMin: minAttendance,
    expectedAttendanceMax: maxAttendance,
  };
}

async function populateEventVehicleLinks() {
  console.log('🔗 Phase 5: Populating Event-Vehicle Cross-Linking Data\n');

  // Fetch all events
  const events = await db.query.carShowEvents.findMany();
  console.log(`📅 Found ${events.length} events to process\n`);

  let updatedCount = 0;

  for (const event of events) {
    const focus = parseEventForVehicles(
      event.eventName,
      event.eventCategory,
      event.eventType
    );

    // Update event with vehicle focus data
    await db.update(carShowEvents)
      .set({
        vehicleMakes: JSON.stringify(focus.vehicleMakes),
        vehicleModels: focus.vehicleModels.length > 0 ? JSON.stringify(focus.vehicleModels) : null,
        primaryVehicleFocus: focus.primaryVehicleFocus,
        expectedAttendanceMin: focus.expectedAttendanceMin,
        expectedAttendanceMax: focus.expectedAttendanceMax,
      })
      .where(eq(carShowEvents.id, event.id));

    updatedCount++;

    console.log(`✅ ${event.eventName}`);
    console.log(`   Category: ${event.eventCategory || 'none'} | Type: ${event.eventType}`);
    console.log(`   Makes: ${focus.vehicleMakes.join(', ') || 'General'}`);
    if (focus.vehicleModels.length > 0) {
      console.log(`   Models: ${focus.vehicleModels.join(', ')}`);
    }
    console.log(`   Focus: ${focus.primaryVehicleFocus}`);
    console.log(`   Expected Attendance: ${focus.expectedAttendanceMin}-${focus.expectedAttendanceMax}`);
    console.log('');
  }

  console.log(`\n✨ Successfully updated ${updatedCount} events with vehicle cross-linking data`);
  console.log('\n📊 Summary:');

  // Show summary statistics
  const modelEvents = events.filter(e => {
    const focus = parseEventForVehicles(e.eventName, e.eventCategory, e.eventType);
    return focus.primaryVehicleFocus === 'model';
  });

  const makeEvents = events.filter(e => {
    const focus = parseEventForVehicles(e.eventName, e.eventCategory, e.eventType);
    return focus.primaryVehicleFocus === 'make';
  });

  const categoryEvents = events.filter(e => {
    const focus = parseEventForVehicles(e.eventName, e.eventCategory, e.eventType);
    return focus.primaryVehicleFocus === 'category';
  });

  console.log(`   Model-specific events: ${modelEvents.length}`);
  console.log(`   Make-specific events: ${makeEvents.length}`);
  console.log(`   Category-based events: ${categoryEvents.length}`);
  console.log(`   General/Era events: ${events.length - modelEvents.length - makeEvents.length - categoryEvents.length}`);
}

// Run the population script
populateEventVehicleLinks()
  .catch(console.error)
  .finally(() => process.exit(0));
