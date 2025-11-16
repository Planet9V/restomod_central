# SQLite to PostgreSQL Migration Guide

This guide explains how to migrate your data from SQLite to PostgreSQL using the provided migration scripts.

## Overview

The migration process consists of three main steps:

1. **Export** - Export all data from SQLite to JSON files
2. **Setup** - Configure PostgreSQL database
3. **Import** - Import JSON data into PostgreSQL with transformations

## Prerequisites

- Node.js and npm installed
- PostgreSQL database server running
- Access to create PostgreSQL databases and users

## Step-by-Step Migration Process

### Step 1: Export Data from SQLite

Export all existing data from your SQLite database to JSON files:

```bash
# Ensure DATABASE_URL points to SQLite (or leave unset to use default)
export DATABASE_URL="./db/local.db"

# Run the export script
tsx scripts/export-from-sqlite.ts
```

This will create JSON files in the `data/migration/` directory, one file per table.

**What happens:**
- All tables are exported in dependency order
- Data is saved as JSON for easy inspection and modification
- Progress is displayed for each table
- Summary shows total records exported

### Step 2: Set Up PostgreSQL Database

Create and configure your PostgreSQL database:

#### Option A: Local PostgreSQL

```bash
# Create database
createdb restomod_central

# Create user (optional)
psql -c "CREATE USER restomod WITH PASSWORD 'your_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE restomod_central TO restomod;"
```

#### Option B: Cloud PostgreSQL (e.g., Render, Railway, Neon)

1. Create a new PostgreSQL database instance
2. Copy the connection string provided by your service

#### Configure Environment Variables

Update your `.env` file with the PostgreSQL connection string:

```bash
# For local PostgreSQL
DATABASE_URL="postgresql://restomod:your_password@localhost:5432/restomod_central"

# For cloud PostgreSQL (example)
DATABASE_URL="postgresql://user:password@host.region.provider.com:5432/database"
```

#### Run Database Migrations

Generate and apply PostgreSQL schema:

```bash
# Generate PostgreSQL migrations from schema
npm run db:generate

# Apply migrations to create tables
npm run db:migrate
```

### Step 3: Import Data into PostgreSQL

Import all exported JSON data into PostgreSQL:

```bash
# Ensure DATABASE_URL points to PostgreSQL
export DATABASE_URL="postgresql://user:password@host:5432/database"

# Run the import script
tsx scripts/import-to-postgres.ts
```

**What happens:**
- Tables are imported in correct dependency order
- Data transformations are applied:
  - SQLite timestamps (integers) → PostgreSQL timestamps (DATE)
  - SQLite booleans (0/1) → PostgreSQL booleans (true/false)
  - JSON fields are preserved
  - Auto-increment IDs are handled
- Foreign key relationships are validated
- Data integrity checks are performed
- Progress is displayed for each table
- Final summary shows all imported records

## Data Transformations

The import script automatically handles these transformations:

### 1. Timestamp Conversion

**SQLite:** Integer (milliseconds since epoch)
```json
{ "created_at": 1699564800000 }
```

**PostgreSQL:** TIMESTAMP
```json
{ "created_at": "2023-11-10T00:00:00.000Z" }
```

### 2. Boolean Conversion

**SQLite:** Integer (0 or 1)
```json
{ "is_admin": 1 }
```

**PostgreSQL:** Boolean
```json
{ "is_admin": true }
```

### 3. JSON Fields

**Both:** JSON is preserved as-is
```json
{
  "features": ["feature1", "feature2"],
  "specs": { "engine": "V8", "hp": 450 }
}
```

### 4. Foreign Key Handling

- Import order ensures parent records exist before children
- Validation checks for orphaned records
- Errors are reported for missing references

## Import Order (Dependency Resolution)

### Phase 1: Independent Tables
- users
- projects
- testimonials
- team_members
- companies
- newsletter_subscribers
- contact_submissions
- hero_content
- engineering_features
- market_data
- process_steps
- research_articles
- engine_options
- transmission_options
- color_options
- wheel_options
- interior_options
- ai_options
- additional_options

### Phase 2: Core Data Tables
- luxury_showcases (references projects - optional)
- market_valuations
- builder_profiles
- technical_specifications
- event_venues
- build_guides
- investment_analytics
- vendor_partnerships
- car_show_events
- cars_for_sale
- gateway_vehicles

### Phase 3: Configurator Data
- enhanced_vehicle_platforms
- enhanced_engine_options
- enhanced_transmission_options
- configurator_suspension_options
- configurator_rear_axle_options
- configurator_fuel_system_options
- enhanced_interior_options
- configurator_bodywork_options
- configurator_glass_options
- configurator_car_models
- simple_transmission_options
- configurator_color_options
- configurator_wheel_options
- configurator_interior_options

### Phase 4: Dependent Tables
- user_configurations (references users)
- user_preferences (references users)
- user_itineraries (references users, car_show_events)
- event_comments (references users, car_show_events)
- price_history (references cars_for_sale)
- configurator_customer_configurations

## Validation & Integrity Checks

The import script performs comprehensive validation:

### Foreign Key Validation
- ✓ user_configurations → users
- ✓ user_preferences → users
- ✓ user_itineraries → users, car_show_events
- ✓ event_comments → users, car_show_events
- ✓ price_history → cars_for_sale

### Data Integrity Checks
- ✓ No duplicate usernames
- ✓ No duplicate emails
- ✓ All required fields populated
- ✓ Valid data types
- ✓ Referential integrity maintained

## Troubleshooting

### Error: "Migration directory not found"

**Problem:** The export script hasn't been run yet.

**Solution:**
```bash
tsx scripts/export-from-sqlite.ts
```

### Error: "DATABASE_URL must be PostgreSQL"

**Problem:** DATABASE_URL still points to SQLite.

**Solution:**
```bash
export DATABASE_URL="postgresql://user:password@host:5432/database"
```

### Error: "Orphaned records found"

**Problem:** Data has foreign key references to non-existent records.

**Solution:**
1. Review the error output to identify problematic records
2. Fix the data in SQLite and re-export
3. Or manually fix the JSON files in `data/migration/`
4. Re-run the import script

### Error: "Duplicate key violation"

**Problem:** Unique constraint violation (e.g., duplicate username/email).

**Solution:**
1. Check SQLite database for duplicates
2. Clean up duplicates before export
3. Re-export and re-import

### Partial Import Failure

**Problem:** Some tables imported successfully, others failed.

**Solution:**
1. Review error messages
2. Fix the problematic data
3. Delete all data from PostgreSQL tables
4. Re-run the import script

To delete all data:
```sql
-- Connect to PostgreSQL
psql -d restomod_central

-- Truncate all tables (in reverse dependency order)
TRUNCATE TABLE price_history CASCADE;
TRUNCATE TABLE event_comments CASCADE;
TRUNCATE TABLE user_itineraries CASCADE;
TRUNCATE TABLE user_preferences CASCADE;
TRUNCATE TABLE user_configurations CASCADE;
-- ... (continue for all tables)

-- Or drop and recreate all tables
-- Then re-run db:migrate
```

## Verification

After successful import, verify the migration:

### 1. Check Record Counts

The import script displays final counts for all tables. Compare these with your SQLite database.

### 2. Spot Check Data

```sql
-- Check a few users
SELECT * FROM users LIMIT 5;

-- Check car show events
SELECT * FROM car_show_events LIMIT 5;

-- Check cars for sale
SELECT * FROM cars_for_sale LIMIT 5;
```

### 3. Test Foreign Keys

```sql
-- Verify user configurations reference valid users
SELECT uc.id, u.username
FROM user_configurations uc
JOIN users u ON uc.user_id = u.id
LIMIT 5;

-- Verify price history references valid vehicles
SELECT ph.id, cfs.make, cfs.model
FROM price_history ph
JOIN cars_for_sale cfs ON ph.vehicle_id = cfs.id
LIMIT 5;
```

### 4. Test Application

Start your application with PostgreSQL:

```bash
npm run dev
```

Navigate through the application and verify:
- User authentication works
- Car listings display correctly
- Events show properly
- Configurator functions correctly

## Rollback Plan

If you need to rollback to SQLite:

1. **Keep SQLite database:** Don't delete `db/local.db`
2. **Restore DATABASE_URL:**
   ```bash
   export DATABASE_URL="./db/local.db"
   ```
3. **Restart application:**
   ```bash
   npm run dev
   ```

## Performance Considerations

### Import Speed

- **Batch Size:** Default is 100 records per batch
- **Adjust:** Modify `batchSize` parameter in script if needed
- **Expected Time:** ~1-5 seconds per 100 records

### Large Datasets

For databases with millions of records:

1. Increase batch size to 500-1000
2. Disable validation temporarily (edit script)
3. Run validation separately after import
4. Consider splitting into multiple import sessions

## Next Steps

After successful migration:

1. ✓ Update production environment variables
2. ✓ Deploy application with PostgreSQL configuration
3. ✓ Monitor application logs for any issues
4. ✓ Set up PostgreSQL backups
5. ✓ Remove SQLite database (after verification)

## Support

If you encounter issues not covered in this guide:

1. Check application logs
2. Review PostgreSQL logs
3. Verify all environment variables
4. Ensure PostgreSQL version compatibility (14+)

## Database Maintenance

### Regular Backups

```bash
# Backup PostgreSQL database
pg_dump -U restomod restomod_central > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -U restomod restomod_central < backup_20231110.sql
```

### Monitoring

```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('restomod_central'));

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

**Migration Scripts:**
- Export: `scripts/export-from-sqlite.ts`
- Import: `scripts/import-to-postgres.ts`

**Generated Files:**
- JSON exports: `data/migration/*.json`
