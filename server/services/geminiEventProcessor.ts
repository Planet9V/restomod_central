import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../../db';
import { carShowEvents, carShowEventsInsertSchema } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Gemini AI Event Processor - Intelligently categorizes and stores car show events
 * Processes new research data and determines optimal database placement
 */
export class GeminiEventProcessor {
  private gemini: GoogleGenerativeAI;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  /**
   * Process new event research data with Gemini AI analysis
   */
  async processEventData(rawEventData: string, sourceUrl?: string) {
    try {
      console.log('🤖 Processing new event data with Gemini AI...');
      
      const model = this.gemini.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `
You are an expert classic car show event analyzer. Analyze the following text and extract structured car show event information.

TASK: Extract and structure car show/automotive event data from the provided text.

REQUIREMENTS:
1. Only extract real, specific automotive events (car shows, auctions, concours, cruise-ins, swap meets)
2. Ensure all dates are valid and in the future or current year
3. Categorize events appropriately
4. Generate SEO-friendly slugs
5. Extract all available contact and venue information

RESPONSE FORMAT: Return a JSON array of events with this exact structure:
[
  {
    "eventName": "string (required)",
    "eventSlug": "string (kebab-case, unique)",
    "venue": "string (required)",
    "venueName": "string (optional)",
    "address": "string (optional)",
    "city": "string (required)",
    "state": "string (required)",
    "country": "string (default: USA)",
    "zipCode": "string (optional)",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD (optional)",
    "eventType": "auction|car_show|concours|cruise_in|swap_meet",
    "eventCategory": "classic|muscle|hot_rod|exotic|general",
    "description": "string (optional)",
    "website": "string (optional)",
    "organizerName": "string (optional)",
    "organizerContact": "string (optional)",
    "organizerEmail": "string (optional)",
    "organizerPhone": "string (optional)",
    "entryFeeSpectator": "string (optional)",
    "entryFeeParticipant": "string (optional)",
    "capacity": "number (optional)",
    "features": "string (JSON array)",
    "amenities": "string (JSON array)",
    "vehicleRequirements": "string (optional)",
    "judgingClasses": "string (JSON array)",
    "awards": "string (JSON array)",
    "foodVendors": "boolean",
    "swapMeet": "boolean",
    "liveMusic": "boolean",
    "kidsActivities": "boolean",
    "featured": "boolean",
    "dataSource": "gemini_processed",
    "verificationStatus": "pending"
  }
]

TEXT TO ANALYZE:
${rawEventData}

Return only the JSON array, no additional text or explanation.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse Gemini response
      let eventData;
      try {
        eventData = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', text);
        throw new Error('Invalid JSON response from Gemini AI');
      }

      if (!Array.isArray(eventData)) {
        throw new Error('Gemini response must be an array of events');
      }

      // Process and store events in database
      const storedEvents = [];
      for (const event of eventData) {
        try {
          // Add source URL if provided
          if (sourceUrl) {
            event.sourceUrl = sourceUrl;
          }

          // Validate event data
          const validatedEvent = carShowEventsInsertSchema.parse(event);
          
          // Check if event already exists
          const existingEvent = await db.select()
            .from(carShowEvents)
            .where(eq(carShowEvents.eventSlug, validatedEvent.eventSlug))
            .limit(1);

          if (existingEvent.length === 0) {
            // Insert new event
            const [newEvent] = await db.insert(carShowEvents)
              .values(validatedEvent)
              .returning();
            
            storedEvents.push(newEvent);
            console.log(`✅ Stored new event: ${newEvent.eventName}`);
          } else {
            // Update existing event if needed
            const [updatedEvent] = await db.update(carShowEvents)
              .set({ 
                ...validatedEvent, 
                updatedAt: new Date(),
                verificationStatus: 'needs_update'
              })
              .where(eq(carShowEvents.eventSlug, validatedEvent.eventSlug))
              .returning();
            
            storedEvents.push(updatedEvent);
            console.log(`🔄 Updated existing event: ${updatedEvent.eventName}`);
          }
        } catch (eventError) {
          console.error(`Failed to process event:`, event, eventError);
        }
      }

      return {
        success: true,
        eventsProcessed: eventData.length,
        eventsStored: storedEvents.length,
        events: storedEvents
      };

    } catch (error) {
      console.error('Error processing event data with Gemini:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        eventsProcessed: 0,
        eventsStored: 0
      };
    }
  }

  /**
   * Analyze and categorize event text to determine database placement
   */
  async categorizeEventContent(content: string) {
    try {
      const model = this.gemini.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `
Analyze this automotive content and determine the best database categorization:

CONTENT:
${content}

TASK: Determine which database table(s) this content belongs in:
- car_show_events (specific event listings)
- event_venues (venue information)
- market_valuations (pricing/valuation data)
- vendor_partnerships (business partnerships)
- technical_specifications (technical/parts data)
- builder_profiles (shop/builder information)

RESPONSE FORMAT (JSON):
{
  "primaryCategory": "table_name",
  "confidence": 0.95,
  "secondaryCategories": ["table_name"],
  "extractedData": {
    "eventCount": 0,
    "venueCount": 0,
    "hasValuationData": false,
    "hasTechnicalData": false,
    "hasVendorData": false
  },
  "recommendation": "string explaining where to store this data"
}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(text);
      
    } catch (error) {
      console.error('Error categorizing content:', error);
      return {
        primaryCategory: 'car_show_events',
        confidence: 0.5,
        recommendation: 'Default categorization due to analysis error'
      };
    }
  }

  /**
   * Search for new events in research documents
   */
  async searchForNewEvents(documentsPath: string = 'attached_assets') {
    console.log('🔍 Searching for new car show events in research documents...');
    
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const searchPatterns = [
        /car show/gi,
        /auto show/gi,
        /concours/gi,
        /auction/gi,
        /cruise.*in/gi,
        /swap meet/gi,
        /Barrett.?Jackson/gi,
        /Mecum/gi,
        /Pebble Beach/gi,
        /Goodguys/gi
      ];

      const documentFiles = fs.readdirSync(documentsPath)
        .filter(file => file.endsWith('.txt') || file.endsWith('.md'))
        .map(file => path.join(documentsPath, file));

      let totalEventsFound = 0;
      const results = [];

      for (const filePath of documentFiles) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          
          // Check if content contains event-related keywords
          const hasEventContent = searchPatterns.some(pattern => pattern.test(content));
          
          if (hasEventContent) {
            console.log(`📄 Processing ${path.basename(filePath)} for events...`);
            
            const result = await this.processEventData(content, filePath);
            if (result.success && result.eventsStored > 0) {
              totalEventsFound += result.eventsStored;
              results.push({
                file: path.basename(filePath),
                ...result
              });
            }
          }
        } catch (fileError) {
          console.error(`Error processing ${filePath}:`, fileError);
        }
      }

      return {
        success: true,
        totalEventsFound,
        documentsProcessed: results.length,
        results
      };

    } catch (error) {
      console.error('Error searching for new events:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get all events from database with search/filter capabilities
   */
  async getEvents(filters?: {
    eventType?: string;
    state?: string;
    featured?: boolean;
    status?: string;
    limit?: number;
  }) {
    try {
      let query = db.select().from(carShowEvents);
      
      // Apply filters
      if (filters?.eventType) {
        query = query.where(eq(carShowEvents.eventType, filters.eventType));
      }
      if (filters?.state) {
        query = query.where(eq(carShowEvents.state, filters.state));
      }
      if (filters?.featured !== undefined) {
        query = query.where(eq(carShowEvents.featured, filters.featured));
      }
      if (filters?.status) {
        query = query.where(eq(carShowEvents.status, filters.status));
      }
      
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const events = await query;
      return { success: true, events };
      
    } catch (error) {
      console.error('Error fetching events:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        events: [] 
      };
    }
  }
}

export const geminiEventProcessor = new GeminiEventProcessor();