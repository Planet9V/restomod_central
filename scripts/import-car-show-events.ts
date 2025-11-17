/**
 * Import Car Show Events from JSON
 *
 * Imports car shows, cruise nights, auctions, and concours events
 * from JSON file into the car_show_events database table.
 *
 * Usage:
 *   npm run import:events
 *   tsx scripts/import-car-show-events.ts
 *   tsx scripts/import-car-show-events.ts --file=data/custom-events.json
 */

import { db } from '../db';
import { carShowEvents } from '../shared/schema';
import type { InsertCarShowEvent } from '../shared/schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

interface EventData {
  eventName: string;
  eventSlug: string;
  venue: string;
  venueName?: string;
  address?: string;
  city: string;
  state: string;
  country?: string;
  zipCode?: string;
  startDate: string;
  endDate?: string;
  eventType: string;
  eventCategory?: string;
  description?: string;
  website?: string;
  organizerName?: string;
  organizerContact?: string;
  organizerEmail?: string;
  organizerPhone?: string;
  entryFeeSpectator?: string;
  entryFeeParticipant?: string;
  registrationDeadline?: string;
  capacity?: number;
  expectedAttendance?: number;
  expectedAttendanceMin?: number;
  expectedAttendanceMax?: number;
  features?: string;
  amenities?: string;
  vehicleRequirements?: string;
  judgingClasses?: string;
  awards?: string;
  parkingInfo?: string;
  foodVendors?: boolean;
  swapMeet?: boolean;
  liveMusic?: boolean;
  kidsActivities?: boolean;
  weatherContingency?: string;
  specialNotes?: string;
  imageUrl?: string;
  featured?: boolean;
  status?: string;
  sourceUrl?: string;
  dataSource?: string;
  verificationStatus?: string;
  lastVerified?: string;
  vehicleMakes?: string;
  vehicleModels?: string;
  primaryVehicleFocus?: string;
  createdAt?: string;
  updatedAt?: string;
}

async function importEvents(filename: string) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📅  Importing Car Show Events');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Read JSON file
  const filePath = path.resolve(process.cwd(), filename);
  console.log(`📂 File: ${filename}`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: File not found: ${filename}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const events: EventData[] = JSON.parse(fileContent);

  console.log(`📊 Found ${events.length} events to import\n`);

  let imported = 0;
  let duplicates = 0;
  let errors = 0;

  for (const event of events) {
    try {
      // Check for duplicates by eventSlug
      const existing = await db.select()
        .from(carShowEvents)
        .where(eq(carShowEvents.eventSlug, event.eventSlug))
        .limit(1);

      if (existing.length > 0) {
        console.log(`⏭️  ${event.eventName} - Duplicate (slug: ${event.eventSlug})`);
        duplicates++;
        continue;
      }

      // Prepare event data with proper type conversion
      const now = new Date();
      const eventData: InsertCarShowEvent = {
        eventName: event.eventName,
        eventSlug: event.eventSlug,
        venue: event.venue,
        venueName: event.venueName,
        address: event.address,
        city: event.city,
        state: event.state,
        country: event.country || 'USA',
        zipCode: event.zipCode,

        // Convert date strings to Date objects
        startDate: new Date(event.startDate),
        endDate: event.endDate ? new Date(event.endDate) : undefined,

        eventType: event.eventType,
        eventCategory: event.eventCategory,
        description: event.description,
        website: event.website,

        organizerName: event.organizerName,
        organizerContact: event.organizerContact,
        organizerEmail: event.organizerEmail,
        organizerPhone: event.organizerPhone,

        entryFeeSpectator: event.entryFeeSpectator,
        entryFeeParticipant: event.entryFeeParticipant,
        registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline) : undefined,

        capacity: event.capacity,
        expectedAttendance: event.expectedAttendance,
        expectedAttendanceMin: event.expectedAttendanceMin,
        expectedAttendanceMax: event.expectedAttendanceMax,

        // JSON strings (already stringified in source)
        features: event.features,
        amenities: event.amenities,
        vehicleRequirements: event.vehicleRequirements,
        judgingClasses: event.judgingClasses,
        awards: event.awards,

        parkingInfo: event.parkingInfo,
        foodVendors: event.foodVendors || false,
        swapMeet: event.swapMeet || false,
        liveMusic: event.liveMusic || false,
        kidsActivities: event.kidsActivities || false,

        weatherContingency: event.weatherContingency,
        specialNotes: event.specialNotes,
        imageUrl: event.imageUrl,
        featured: event.featured || false,

        status: event.status || 'active',
        sourceUrl: event.sourceUrl,
        dataSource: event.dataSource || 'web_research',
        verificationStatus: event.verificationStatus || 'pending',
        lastVerified: event.lastVerified ? new Date(event.lastVerified) : undefined,

        vehicleMakes: event.vehicleMakes,
        vehicleModels: event.vehicleModels,
        primaryVehicleFocus: event.primaryVehicleFocus,

        createdAt: event.createdAt ? new Date(event.createdAt) : now,
        updatedAt: event.updatedAt ? new Date(event.updatedAt) : now,
      };

      // Insert into database
      await db.insert(carShowEvents).values(eventData);

      const dateStr = eventData.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      console.log(`✅ ${event.eventName} - ${event.city}, ${event.state} (${dateStr})`);
      imported++;

    } catch (error) {
      console.error(`❌ Error importing ${event.eventName}:`, error);
      errors++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊  Import Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ Imported: ${imported}`);
  console.log(`⏭️  Duplicates: ${duplicates}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`📦 Total Processed: ${events.length}\n`);

  if (imported > 0) {
    console.log('🎉 Success! Next steps:');
    console.log('   1. View events: npm run dev → http://localhost:5000/events');
    console.log('   2. Check database: sqlite3 db/local.db "SELECT COUNT(*) FROM car_show_events;"\n');
  }
}

// Get filename from command line args or use default
const args = process.argv.slice(2);
const fileArg = args.find(arg => arg.startsWith('--file='));
const filename = fileArg ? fileArg.split('=')[1] : 'data/car-show-events.json';

importEvents(filename)
  .then(() => {
    console.log('✅ Import complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
