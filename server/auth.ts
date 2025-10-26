import { Express, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users, InsertUser } from '../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// JWT secret key (⚠️ DEVELOPMENT ENVIRONMENT)
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  console.warn('⚠️  WARNING: JWT_SECRET not set! Using default development secret.');
  console.warn('   This is INSECURE for production. Set JWT_SECRET environment variable.');
  console.warn('   Generate one with: openssl rand -base64 32');
  return 'DEV_JWT_SECRET_CHANGE_IN_PRODUCTION_' + Math.random().toString(36);
})();

// Password hashing
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Password verification
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// User authentication middleware
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number, isAdmin: boolean };
    res.locals.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Admin authorization middleware
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!res.locals.user || !res.locals.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Optional authentication middleware
export const maybeIsAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.headers.authorization) {
    return isAuthenticated(req, res, next);
  }
  return next();
};

// Setup authentication routes
export function setupAuth(app: Express) {
  // Create initial admin user if none exists
  createInitialAdmin();
  
  // Login route
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.email, email)
      });
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const isValidPassword = await verifyPassword(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = jwt.sign({
        userId: user.id,
        isAdmin: user.isAdmin
      }, JWT_SECRET, { expiresIn: '1d' });
      
      return res.status(200).json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get current user route
  app.get('/api/auth/me', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, res.locals.user.userId)
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      });
    } catch (error) {
      console.error('Get user error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
}

// Create initial admin user (⚠️ DEVELOPMENT ENVIRONMENT ONLY)
async function createInitialAdmin() {
  try {
    // Get admin credentials from environment or use dev defaults
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@restomod.local';
    const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';

    // Warn about development credentials
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      console.warn('\n' + '='.repeat(70));
      console.warn('⚠️  WARNING: Using default development admin credentials!');
      console.warn('   Email: ' + adminEmail);
      console.warn('   Password: ' + adminPassword);
      console.warn('   CHANGE THESE IMMEDIATELY IN PRODUCTION!');
      console.warn('   Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.');
      console.warn('='.repeat(70) + '\n');
    }

    const adminExists = await db.query.users.findFirst({
      where: eq(users.email, adminEmail)
    });

    if (!adminExists) {
      const hashedPassword = await hashPassword(adminPassword);

      await db.insert(users).values({
        username: adminUsername,
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true,
        createdAt: new Date(),
      });

      console.log(`✅ Initial admin user created: ${adminEmail}`);
      console.log('   Please change the password after first login!');
    }
  } catch (error) {
    console.error('Error creating initial admin user:', error);
  }
}
