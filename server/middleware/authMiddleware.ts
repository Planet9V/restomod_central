/**
 * Authentication Middleware - SPEC_02_API_ENDPOINTS.md
 * JWT verification and role-based access control
 *
 * Middleware functions:
 * - requireAuth - Require valid JWT token
 * - requireAdmin - Require admin role
 * - optionalAuth - Optional authentication (attach user if token exists)
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'skinnyrod-secret-key';

/**
 * Extend Express Request to include user
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        username: string;
        isAdmin: boolean;
        isSuperAdmin?: boolean;
      };
    }
  }
}

/**
 * JWT Payload Interface
 */
interface JWTPayload {
  userId: number;
  email: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}

/**
 * requireAuth Middleware
 * Requires valid JWT token
 * Attaches user object to req.user
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Authentication required'
        }
      });
      return;
    }

    // Extract token from "Bearer <token>"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_AUTH_HEADER',
          message: 'Invalid authorization header format'
        }
      });
      return;
    }

    const token = parts[1];

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

      // Get user from database to ensure they still exist
      const user = await db.query.users.findFirst({
        where: eq(users.id, decoded.userId)
      });

      if (!user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User no longer exists'
          }
        });
        return;
      }

      // Attach user to request
      req.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin,
        isSuperAdmin: user.email === 'jims67mustang@gmail.com' // Hardcoded superadmin
      };

      next();

    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Token has expired'
          }
        });
        return;
      }

      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid token'
        }
      });
      return;
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Authentication failed'
      }
    });
    return;
  }
}

/**
 * requireAdmin Middleware
 * Requires user to be admin
 * Must be used after requireAuth
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'NOT_AUTHENTICATED',
        message: 'Authentication required'
      }
    });
    return;
  }

  if (!req.user.isAdmin) {
    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Admin access required'
      }
    });
    return;
  }

  next();
}

/**
 * requireSuperAdmin Middleware
 * Requires user to be superadmin
 * Must be used after requireAuth
 */
export function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'NOT_AUTHENTICATED',
        message: 'Authentication required'
      }
    });
    return;
  }

  if (!req.user.isSuperAdmin) {
    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Superadmin access required'
      }
    });
    return;
  }

  next();
}

/**
 * optionalAuth Middleware
 * Optional authentication
 * Attaches user if valid token exists
 * Does not block if no token
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    // No token - continue without user
    if (!authHeader) {
      next();
      return;
    }

    const parts = authHeader.split(' ');

    // Invalid format - continue without user
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      next();
      return;
    }

    const token = parts[1];

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

      // Get user from database
      const user = await db.query.users.findFirst({
        where: eq(users.id, decoded.userId)
      });

      if (user) {
        // Attach user to request
        req.user = {
          id: user.id,
          email: user.email,
          username: user.username,
          isAdmin: user.isAdmin,
          isSuperAdmin: user.email === 'jims67mustang@gmail.com'
        };
      }

    } catch (jwtError) {
      // Invalid token - continue without user
      // Don't send error response, just continue
    }

    next();

  } catch (error) {
    // Error in middleware - continue without user
    console.error('Optional auth middleware error:', error);
    next();
  }
}

/**
 * extractUserId Helper
 * Returns userId from token without full authentication
 * Useful for rate limiting by user
 */
export function extractUserId(req: Request): number | null {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    const token = parts[1];
    const decoded = jwt.verify(token, JWT_SECRET, {
      ignoreExpiration: true
    }) as JWTPayload;

    return decoded.userId;

  } catch (error) {
    return null;
  }
}
