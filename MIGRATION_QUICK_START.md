# PostgreSQL Migration - Quick Start Guide

Quick reference for migrating from SQLite to PostgreSQL.

## 📋 Overview

Three simple steps to migrate your database:

```bash
# 1. Export from SQLite
npm run migrate:export

# 2. Import to PostgreSQL
npm run migrate:import

# 3. Validate migration
npm run migrate:validate

# Or run all at once
npm run migrate:full
```

## 🚀 Quick Migration

### Step 1: Export Data

```bash
# Set SQLite database (optional, uses default)
export DATABASE_URL="./db/local.db"

# Export all data to JSON
npm run migrate:export
```

**Output:** JSON files in `data/migration/` directory

### Step 2: Setup PostgreSQL

```bash
# Create PostgreSQL database
createdb restomod_central

# Set PostgreSQL connection
export DATABASE_URL="postgresql://user:password@localhost:5432/restomod_central"

# Run migrations to create tables
npm run db:generate
npm run db:migrate
```

### Step 3: Import Data

```bash
# Import all JSON data to PostgreSQL
npm run migrate:import
```

**Output:** All data imported and validated

### Step 4: Validate (Optional)

```bash
# Validate the migration
npm run migrate:validate
```

## 📁 Files Created

| File | Purpose |
|------|---------|
| `scripts/export-from-sqlite.ts` | Export SQLite data to JSON |
| `scripts/import-to-postgres.ts` | Import JSON data to PostgreSQL |
| `scripts/validate-migration.ts` | Validate migration success |
| `MIGRATION_GUIDE.md` | Comprehensive migration guide |
| `data/migration/*.json` | Exported data files |

## 🔧 NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Export | `npm run migrate:export` | Export SQLite → JSON |
| Import | `npm run migrate:import` | Import JSON → PostgreSQL |
| Validate | `npm run migrate:validate` | Validate migration |
| Full | `npm run migrate:full` | All steps at once |

## ✅ What Gets Migrated

### Independent Tables (Phase 1)
- ✓ users
- ✓ projects
- ✓ testimonials
- ✓ team_members
- ✓ companies
- ✓ newsletter_subscribers
- ✓ contact_submissions
- ✓ hero_content
- ✓ engineering_features
- ✓ market_data
- ✓ process_steps
- ✓ research_articles
- ✓ Configurator options (engine, transmission, color, wheel, interior, ai, additional)

### Core Data Tables (Phase 2)
- ✓ luxury_showcases
- ✓ market_valuations
- ✓ builder_profiles
- ✓ technical_specifications
- ✓ event_venues
- ✓ build_guides
- ✓ investment_analytics
- ✓ vendor_partnerships
- ✓ car_show_events
- ✓ cars_for_sale
- ✓ gateway_vehicles

### Enhanced Configurator (Phase 3)
- ✓ enhanced_vehicle_platforms
- ✓ enhanced_engine_options
- ✓ enhanced_transmission_options
- ✓ configurator_suspension_options
- ✓ configurator_rear_axle_options
- ✓ configurator_fuel_system_options
- ✓ enhanced_interior_options
- ✓ configurator_bodywork_options
- ✓ configurator_glass_options
- ✓ And more configurator tables...

### Dependent Tables (Phase 4)
- ✓ user_configurations (→ users)
- ✓ user_preferences (→ users)
- ✓ user_itineraries (→ users, car_show_events)
- ✓ event_comments (→ users, car_show_events)
- ✓ price_history (→ cars_for_sale)
- ✓ configurator_customer_configurations

## 🔄 Data Transformations

The import script automatically handles:

| SQLite | PostgreSQL |
|--------|------------|
| Integer timestamps | TIMESTAMP |
| 0/1 booleans | true/false |
| JSON strings | JSON type |
| Auto-increment IDs | SERIAL |

## 🔍 Validations Performed

- ✓ Foreign key integrity
- ✓ No duplicate usernames/emails
- ✓ Required fields populated
- ✓ Valid timestamps
- ✓ Table record counts
- ✓ Orphaned record detection

## ⚠️ Troubleshooting

### Migration directory not found
```bash
npm run migrate:export
```

### Wrong DATABASE_URL
```bash
# For export (SQLite)
export DATABASE_URL="./db/local.db"

# For import (PostgreSQL)
export DATABASE_URL="postgresql://user:pass@host:5432/db"
```

### Orphaned records
Fix data in SQLite, then re-export and re-import

### Duplicate keys
Remove duplicates from SQLite before export

## 📚 More Information

See `MIGRATION_GUIDE.md` for:
- Detailed migration steps
- Advanced troubleshooting
- Rollback procedures
- Performance tuning
- Production deployment

## 🎯 Quick Commands

```bash
# Full migration in one command
npm run migrate:full

# Individual steps
npm run migrate:export    # Step 1: Export
npm run migrate:import    # Step 2: Import
npm run migrate:validate  # Step 3: Validate

# Troubleshooting
tsx scripts/export-from-sqlite.ts --verbose
tsx scripts/import-to-postgres.ts --verbose
```

## ✨ Success Indicators

After successful migration, you should see:

```
✓ Imported X records
✓ All foreign keys valid
✓ All data integrity checks passed
✓ No duplicate usernames
✓ No duplicate emails
✅ Migration validation PASSED!
```

## 🚦 Next Steps

1. ✅ Migration complete
2. Update production DATABASE_URL
3. Deploy application
4. Monitor for issues
5. Set up PostgreSQL backups
6. Remove old SQLite database (after verification)

---

**Need Help?** See `MIGRATION_GUIDE.md` for comprehensive documentation.
