# Database Test Infrastructure

This directory contains comprehensive test infrastructure for validating database migrations and integrity.

## Overview

The test suite validates:
- PostgreSQL connection and configuration
- pgvector extension installation and functionality
- Database schema completeness (all tables exist)
- Data integrity and foreign key constraints
- Vector column operations (PostgreSQL only)
- CRUD operations
- Database health checks

## Directory Structure

```
server/__tests__/
├── README.md                    # This file
├── setup/
│   └── database.test.ts         # Main database validation tests
└── utils/
    └── testDb.ts                # Test database utilities and helpers
```

## Running Tests

### Run all database tests
```bash
npm run test:db
```

### Run tests in watch mode (auto-rerun on changes)
```bash
npm run test:db:watch
```

### Run tests with UI interface
```bash
npm run test:db:ui
```

### Run all tests in the project
```bash
npm test
```

## Test Utilities (`utils/testDb.ts`)

The test utilities provide helper functions for database testing:

### Connection Management
- `setupTestDatabase()` - Initializes test database connection
- `teardownTestDatabase()` - Cleanly closes database connections
- `getTestDb()` - Returns the active test database instance
- `isPostgresDatabase()` - Checks if connected to PostgreSQL

### Data Operations
- `seedTestData(db)` - Seeds test data for validation
- `cleanupTestData(db)` - Removes test data after tests
- `getTableRowCounts(db)` - Returns row counts for all tables

### Validation Helpers
- `checkPgVectorExtension(db)` - Verifies pgvector extension (PostgreSQL)
- `verifyForeignKeyConstraints(db)` - Validates foreign key integrity
- `getAllTableNames()` - Returns list of all schema tables

## Test Suites

### 1. Database Connection
Validates basic connectivity and SQL execution capabilities.

### 2. PostgreSQL Extensions
- Checks for pgvector extension installation
- Verifies extension version
- Tests vector operations (distance calculations)

### 3. Database Schema - Table Existence
Validates all required tables exist:
- Core tables (users, projects, testimonials)
- Car show tables (events, venues)
- Marketplace tables (cars_for_sale, gateway_vehicles)
- Enhanced configurator tables
- Market research tables

### 4. Data Integrity
- Verifies accurate row counts
- Validates foreign key constraints
- Checks for orphaned records
- Validates JSON data in JSON columns

### 5. CRUD Operations
Tests create, read, update, and delete operations:
- Seed test data
- Query seeded data
- Update records
- Delete records and verify cleanup

### 6. Vector Functionality (PostgreSQL only)
- Vector distance calculations
- Vector column creation
- Vector data insertion and querying

### 7. Database Health Checks
- Orphaned record detection
- Timestamp validation
- JSON data validation

### 8. Migration Summary
Generates comprehensive migration report including:
- Database type (PostgreSQL/SQLite)
- Total tables and records
- Foreign key validation status
- pgvector extension status

## Environment Configuration

Tests use the `DATABASE_URL` environment variable from `.env`:

### SQLite (Development)
```env
DATABASE_URL="./db/local.db"
```

### PostgreSQL (Production)
```env
DATABASE_URL="postgresql://user:password@host:port/database"
```

## Test Database Setup

### For SQLite
No additional setup required. Tests run against the local SQLite database.

### For PostgreSQL
1. Ensure PostgreSQL server is running
2. Verify pgvector extension is installed:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Update `.env` with PostgreSQL connection string
4. Run migrations: `npm run db:migrate`

## Best Practices

1. **Isolation**: Tests use separate test data with unique identifiers
2. **Cleanup**: Always clean up test data in `afterAll()` hooks
3. **Assertions**: Use descriptive assertions with clear error messages
4. **Logging**: Important validation steps include console logging
5. **Conditional Tests**: PostgreSQL-specific tests skip on SQLite

## Adding New Tests

To add new database validation tests:

1. Add test suite to `database.test.ts`:
```typescript
describe('New Test Suite', () => {
  it('should validate something', async () => {
    // Your test logic
    expect(result).toBe(expected);
  });
});
```

2. Add helper functions to `testDb.ts` if needed:
```typescript
export async function newHelper(db: any) {
  // Helper logic
  return result;
}
```

## Troubleshooting

### Connection Errors
- Verify `DATABASE_URL` is set correctly
- Check database server is running
- Verify network connectivity (PostgreSQL)

### pgvector Extension Missing
- PostgreSQL only: Install extension
  ```sql
  CREATE EXTENSION vector;
  ```
- SQLite: Vector tests automatically skip

### Foreign Key Violations
- Run `npm run db:migrate` to apply schema changes
- Check for data inconsistencies
- Verify migration order

### Test Timeouts
- Increase timeout in `vitest.config.ts`
- Check database performance
- Optimize queries in tests

## CI/CD Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Database Tests
  run: npm run test:db
  env:
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```

## Performance Considerations

- Tests run sequentially to avoid race conditions
- Connection pooling is limited (max: 1) for tests
- Large datasets may increase test execution time
- Consider separate test database for large projects

## Future Enhancements

Potential improvements for test infrastructure:
- [ ] Snapshot testing for schema changes
- [ ] Performance benchmarking tests
- [ ] Concurrent test execution with isolated databases
- [ ] Migration rollback testing
- [ ] Database seeding from fixtures
- [ ] Schema diff validation
- [ ] Query performance profiling

## Support

For issues or questions:
1. Check this README
2. Review test output for detailed error messages
3. Consult database logs
4. Review migration history
