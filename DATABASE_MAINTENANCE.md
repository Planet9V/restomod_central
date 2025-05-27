# Database Maintenance Guide for Skinny's Rod and Custom

## Overview
Your automotive platform uses a PostgreSQL database to store authentic Gateway Classic Cars inventory, car show events, and other critical data. This guide explains how to maintain database reliability and prevent connection issues.

## Why Databases Get Disabled

### Common Causes:
1. **Neon Database Sleep Mode** - Free tier databases hibernate after inactivity
2. **Resource Limits** - Connection limits or query timeouts exceeded  
3. **Control Plane Issues** - Temporary Neon infrastructure problems
4. **Network Connectivity** - Intermittent connection drops
5. **Configuration Changes** - Environment variable updates

### Prevention Strategies:
- Regular health monitoring (implemented automatically)
- Connection pooling and retries
- Fallback to direct data services for critical functions
- Proactive error detection and alerting

## Database Health Monitoring System

### Automatic Monitoring Features:
✅ **Startup Health Check** - Database verified when application starts
✅ **Periodic Monitoring** - Health checked every 5 minutes
✅ **Table Verification** - Confirms all critical tables exist and have data
✅ **Performance Tracking** - Monitors query response times
✅ **Error Logging** - Detailed error reporting with recommendations

### Health Check Endpoints:
- `GET /api/database/health` - JSON health status
- `GET /api/database/health-report` - Detailed text report  
- `GET /api/database/health-history` - Historical monitoring data

### Critical Tables Monitored:
1. `car_show_events` - Your authentic automotive event data
2. `gateway_vehicles` - Gateway Classic Cars St. Louis inventory
3. `projects` - Skinny's Rod and Custom project showcase
4. `testimonials` - Customer testimonials
5. `luxury_showcases` - Premium vehicle displays
6. `research_articles` - Automotive industry content
7. `market_insights` - Market analysis data

## Database Connection Details

### Current Configuration:
- **Provider:** Neon PostgreSQL
- **Connection:** Via DATABASE_URL environment variable
- **Location:** US East region
- **Backup Strategy:** Automatic Neon backups

### Environment Variables:
```
DATABASE_URL=postgresql://[credentials]@[endpoint]
PGHOST=[host]
PGPORT=[port]
PGUSER=[username]
PGPASSWORD=[password]
PGDATABASE=[database_name]
```

## Troubleshooting Common Issues

### Issue: "endpoint is disabled"
**Cause:** Neon database has been hibernated or suspended
**Solution:**
1. Check database health: `GET /api/database/health`
2. Restart application to trigger reconnection
3. Verify DATABASE_URL is current
4. Contact Replit support if persistent

### Issue: Connection timeouts
**Cause:** Network latency or database overload
**Solution:**
1. Monitor performance metrics in health report
2. Optimize slow queries
3. Consider connection pooling adjustments

### Issue: Missing tables
**Cause:** Database schema not deployed
**Solution:**
1. Run `npm run db:push` to deploy schema
2. Run `npm run db:seed` to populate data
3. Verify with health check endpoint

## Maintenance Commands

### Database Schema Management:
```bash
# Deploy schema changes
npm run db:push

# Populate with authentic data
npm run db:seed

# Generate migrations (if needed)
npm run db:generate
```

### Health Monitoring:
```bash
# Check current health via API
curl http://localhost:5000/api/database/health

# Get detailed report
curl http://localhost:5000/api/database/health-report

# View monitoring history
curl http://localhost:5000/api/database/health-history
```

## Data Integrity Protection

### Authentic Data Sources:
- Gateway Classic Cars St. Louis inventory (172 vehicles, $2.1M+ value)
- Real automotive events (Barrett-Jackson, RM Sotheby's, etc.)
- Skinny's Rod and Custom project portfolio
- Genuine customer testimonials

### Fallback Strategy:
When database is unavailable, the system automatically switches to:
- Direct access services for critical data
- Cached authentic vehicle inventory
- Real car show events from research files
- No synthetic or placeholder data ever used

## Monitoring Dashboard

### Real-time Status Indicators:
- ✅ Database Connected
- 📊 Table Record Counts
- ⚡ Performance Metrics
- 🔍 Error Detection
- 📈 Uptime Percentage

### Alert Thresholds:
- Connection time > 1000ms
- Failed health checks > 3
- Missing critical tables
- Zero records in key tables

## Best Practices

### For Developers:
1. Always use health check before critical operations
2. Implement proper error handling for database failures
3. Use authentic data services as fallbacks
4. Monitor performance regularly

### For Operations:
1. Check health reports daily
2. Investigate any connection issues immediately
3. Keep DATABASE_URL current
4. Document any configuration changes

## Support Contacts

### Database Issues:
- **Neon Support:** For infrastructure problems
- **Replit Support:** For environment configuration
- **Application Monitoring:** `/api/database/health-report`

### Emergency Procedures:
1. Check application logs for specific errors
2. Verify environment variables are set
3. Test database connection via health endpoint
4. Restart application if connection recovered
5. Contact support with health report if persistent

---

**Last Updated:** January 2025
**Database Provider:** Neon PostgreSQL  
**Monitoring:** Automated every 5 minutes
**Uptime Target:** 99.9%