import { db } from "@db";
import { sql } from "drizzle-orm";

export interface DatabaseHealth {
  isConnected: boolean;
  connectionTime: number;
  lastChecked: Date;
  tables: {
    name: string;
    exists: boolean;
    recordCount: number;
  }[];
  errors: string[];
  endpoint: string;
  performance: {
    queryTime: number;
    averageResponseTime: number;
  };
}

export class DatabaseHealthMonitor {
  private lastHealthCheck: DatabaseHealth | null = null;
  private healthHistory: DatabaseHealth[] = [];
  private maxHistorySize = 100;

  async performHealthCheck(): Promise<DatabaseHealth> {
    const startTime = Date.now();
    const health: DatabaseHealth = {
      isConnected: false,
      connectionTime: 0,
      lastChecked: new Date(),
      tables: [],
      errors: [],
      endpoint: process.env.DATABASE_URL?.substring(0, 50) + "..." || "Unknown",
      performance: {
        queryTime: 0,
        averageResponseTime: 0
      }
    };

    try {
      // Test basic connection
      const connectionStart = Date.now();
      await db.execute(sql`SELECT 1 as test`);
      health.connectionTime = Date.now() - connectionStart;
      health.isConnected = true;

      // Check critical tables for your automotive data
      const criticalTables = [
        'car_show_events',
        'gateway_vehicles', 
        'projects',
        'testimonials',
        'luxury_showcases',
        'research_articles',
        'market_insights'
      ];

      for (const tableName of criticalTables) {
        try {
          const queryStart = Date.now();
          const result = await db.execute(sql`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_name = ${tableName}
          `);
          const queryTime = Date.now() - queryStart;
          
          const exists = result.rows[0]?.count > 0;
          let recordCount = 0;

          if (exists) {
            try {
              const countResult = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM ${tableName}`));
              recordCount = parseInt(countResult.rows[0]?.count as string) || 0;
            } catch (err) {
              health.errors.push(`Could not count records in ${tableName}: ${err}`);
            }
          }

          health.tables.push({
            name: tableName,
            exists,
            recordCount
          });

          health.performance.queryTime += queryTime;
        } catch (err) {
          health.errors.push(`Error checking table ${tableName}: ${err}`);
          health.tables.push({
            name: tableName,
            exists: false,
            recordCount: 0
          });
        }
      }

      health.performance.averageResponseTime = health.performance.queryTime / health.tables.length;

    } catch (err) {
      health.isConnected = false;
      health.errors.push(`Database connection failed: ${err}`);
      console.error('❌ Database Health Check Failed:', err);
    }

    health.performance.queryTime = Date.now() - startTime;
    
    // Store health check result
    this.lastHealthCheck = health;
    this.healthHistory.push(health);
    
    // Keep history manageable
    if (this.healthHistory.length > this.maxHistorySize) {
      this.healthHistory = this.healthHistory.slice(-this.maxHistorySize);
    }

    // Log results
    this.logHealthStatus(health);
    
    return health;
  }

  private logHealthStatus(health: DatabaseHealth) {
    const status = health.isConnected ? '✅' : '❌';
    const responseTime = health.connectionTime;
    
    console.log(`${status} Database Health Check - ${health.lastChecked.toISOString()}`);
    console.log(`   Connection: ${health.isConnected ? 'CONNECTED' : 'DISCONNECTED'} (${responseTime}ms)`);
    console.log(`   Endpoint: ${health.endpoint}`);
    
    if (health.tables.length > 0) {
      console.log('   Tables Status:');
      health.tables.forEach(table => {
        const tableStatus = table.exists ? '✅' : '❌';
        console.log(`     ${tableStatus} ${table.name}: ${table.recordCount} records`);
      });
    }

    if (health.errors.length > 0) {
      console.log('   Errors:');
      health.errors.forEach(error => {
        console.log(`     ⚠️  ${error}`);
      });
    }

    console.log(`   Performance: Avg ${health.performance.averageResponseTime.toFixed(2)}ms per query`);
  }

  getLastHealthCheck(): DatabaseHealth | null {
    return this.lastHealthCheck;
  }

  getHealthHistory(): DatabaseHealth[] {
    return [...this.healthHistory];
  }

  async startPeriodicChecks(intervalMinutes: number = 5) {
    console.log(`🔄 Starting database health monitoring every ${intervalMinutes} minutes`);
    
    // Initial check
    await this.performHealthCheck();
    
    // Set up periodic checks
    setInterval(async () => {
      await this.performHealthCheck();
    }, intervalMinutes * 60 * 1000);
  }

  generateHealthReport(): string {
    if (!this.lastHealthCheck) {
      return "No health check data available";
    }

    const health = this.lastHealthCheck;
    const uptime = this.calculateUptime();
    
    return `
DATABASE HEALTH REPORT
======================
Status: ${health.isConnected ? 'CONNECTED ✅' : 'DISCONNECTED ❌'}
Last Checked: ${health.lastChecked.toISOString()}
Connection Time: ${health.connectionTime}ms
Uptime: ${uptime}%

TABLES STATUS:
${health.tables.map(table => 
  `  ${table.exists ? '✅' : '❌'} ${table.name}: ${table.recordCount} records`
).join('\n')}

PERFORMANCE:
  Average Query Time: ${health.performance.averageResponseTime.toFixed(2)}ms
  Total Check Time: ${health.performance.queryTime}ms

${health.errors.length > 0 ? `
ERRORS:
${health.errors.map(error => `  ⚠️  ${error}`).join('\n')}
` : 'No errors detected ✅'}

RECOMMENDATIONS:
${this.generateRecommendations(health).join('\n')}
    `;
  }

  private calculateUptime(): number {
    if (this.healthHistory.length === 0) return 0;
    
    const successfulChecks = this.healthHistory.filter(check => check.isConnected).length;
    return Math.round((successfulChecks / this.healthHistory.length) * 100);
  }

  private generateRecommendations(health: DatabaseHealth): string[] {
    const recommendations: string[] = [];
    
    if (!health.isConnected) {
      recommendations.push("  🔧 Check DATABASE_URL environment variable");
      recommendations.push("  🔧 Verify Neon database endpoint is active");
      recommendations.push("  🔧 Contact Replit support if issue persists");
    }
    
    if (health.connectionTime > 1000) {
      recommendations.push("  ⚡ Connection time is slow - consider database optimization");
    }
    
    const missingTables = health.tables.filter(table => !table.exists);
    if (missingTables.length > 0) {
      recommendations.push("  📋 Run database migrations: npm run db:push");
      recommendations.push("  📋 Seed missing data: npm run db:seed");
    }
    
    const emptyTables = health.tables.filter(table => table.exists && table.recordCount === 0);
    if (emptyTables.length > 0) {
      recommendations.push(`  📊 Populate empty tables: ${emptyTables.map(t => t.name).join(', ')}`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push("  ✨ Database is healthy and performing well!");
    }
    
    return recommendations;
  }
}

export const databaseHealthMonitor = new DatabaseHealthMonitor();