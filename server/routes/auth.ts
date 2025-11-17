/**
 * Authentication Routes - SPEC_02_API_ENDPOINTS.md
 * JWT-based authentication with 7-day tokens
 *
 * Endpoints:
 * - POST /api/auth/register - Create new user account
 * - POST /api/auth/login - Authenticate and get JWT token
 * - POST /api/auth/refresh - Refresh JWT token
 * - GET /api/auth/me - Get current user info
 * - POST /api/auth/logout - Logout (client-side token removal)
 * - POST /api/auth/forgot-password - Initiate password reset
 * - POST /api/auth/reset-password - Complete password reset
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// In-memory store for password reset tokens (temporary until PostgreSQL migration)
// In production with PostgreSQL, use database passwordResetToken and passwordResetExpires fields
const resetTokens = new Map<string, { userId: number; expires: Date }>();

// Clean up expired tokens every hour
setInterval(() => {
  const now = new Date();
  for (const [token, data] of resetTokens.entries()) {
    if (data.expires < now) {
      resetTokens.delete(token);
    }
  }
}, 3600000); // 1 hour

// JWT Configuration - MUST be set in environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = '7d'; // 7 days as per SPEC_02

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set in environment variables and be at least 32 characters long');
}

/**
 * Validation Schemas
 */

const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username must be alphanumeric'),
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must include uppercase letter')
    .regex(/[a-z]/, 'Password must include lowercase letter')
    .regex(/[0-9]/, 'Password must include number'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  city: z.string().optional(),
  state: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must include uppercase letter')
    .regex(/[a-z]/, 'Password must include lowercase letter')
    .regex(/[0-9]/, 'Password must include number'),
});

/**
 * Helper Functions
 */

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12); // 12 rounds as per SPEC_02
  return await bcrypt.hash(password, salt);
}

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

function generateToken(userId: number, email: string, isAdmin: boolean): string {
  return jwt.sign(
    { userId, email, isAdmin },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

/**
 * POST /api/auth/register
 * Create new user account
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);

    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, validatedData.email)
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Email already registered',
          details: { field: 'email' }
        }
      });
    }

    // Check if username already exists
    const existingUsername = await db.query.users.findFirst({
      where: eq(users.username, validatedData.username)
    });

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USERNAME_EXISTS',
          message: 'Username already taken',
          details: { field: 'username' }
        }
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const [newUser] = await db.insert(users).values({
      username: validatedData.username,
      email: validatedData.email,
      password: hashedPassword,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      city: validatedData.city,
      state: validatedData.state,
      isAdmin: false,
      createdAt: new Date(),
    }).returning();

    // Generate JWT token
    const token = generateToken(newUser.id, newUser.email, false);

    // Return success response
    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          city: newUser.city,
          state: newUser.state,
          isAdmin: newUser.isAdmin,
        },
        token,
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors
        }
      });
    }

    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Registration failed'
      }
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and get JWT token
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { email, password } = loginSchema.parse(req.body);

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Check if account is active (if we add account status later)
    // This placeholder follows SPEC_02 error handling for disabled accounts
    // if (user.status === 'disabled') {
    //   return res.status(403).json({
    //     success: false,
    //     error: {
    //       code: 'ACCOUNT_DISABLED',
    //       message: 'Account has been disabled'
    //     }
    //   });
    // }

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.isAdmin);

    // Return success response with 7-day token expiry
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          city: user.city,
          state: user.state,
          isAdmin: user.isAdmin,
        },
        token,
        expiresIn: 604800 // 7 days in seconds
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors
        }
      });
    }

    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Login failed'
      }
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'No token provided'
        }
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify token (even if expired, we'll refresh it)
      const decoded = jwt.verify(token, JWT_SECRET, {
        ignoreExpiration: true
      }) as { userId: number; email: string; isAdmin: boolean };

      // Get user from database to ensure they still exist
      const user = await db.query.users.findFirst({
        where: eq(users.id, decoded.userId)
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User no longer exists'
          }
        });
      }

      // Generate new token
      const newToken = generateToken(user.id, user.email, user.isAdmin);

      return res.status(200).json({
        success: true,
        data: {
          token: newToken,
          expiresIn: 604800 // 7 days in seconds
        }
      });

    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid token'
        }
      });
    }

  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Token refresh failed'
      }
    });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user info
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'No token provided'
        }
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: number;
        email: string;
        isAdmin: boolean;
      };

      // Get user from database
      const user = await db.query.users.findFirst({
        where: eq(users.id, decoded.userId)
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            city: user.city,
            state: user.state,
            isAdmin: user.isAdmin,
            createdAt: user.createdAt,
          }
        }
      });

    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        }
      });
    }

  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to get user info'
      }
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
router.post('/logout', async (req: Request, res: Response) => {
  // For JWT, logout is handled client-side by removing the token
  // This endpoint is provided for consistency with SPEC_02
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * POST /api/auth/forgot-password
 * Initiate password reset process
 */
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    // Always return success for security (don't reveal if email exists)
    // As per SPEC_02: "always, even if email not found - security"

    if (user) {
      // Generate secure random token
      const resetToken = crypto.randomBytes(32).toString('hex');

      // Store token with expiry (1 hour from now)
      const expires = new Date(Date.now() + 3600000); // 1 hour
      resetTokens.set(resetToken, {
        userId: user.id,
        expires
      });

      // In production with PostgreSQL, store in database:
      // await db.update(users)
      //   .set({
      //     passwordResetToken: resetToken,
      //     passwordResetExpires: expires
      //   })
      //   .where(eq(users.id, user.id));

      console.log('Password reset token generated for:', email);
      console.log('Reset token:', resetToken);
      console.log('Reset link:', `http://localhost:5000/reset-password?token=${resetToken}`);

      // TODO: Send email with reset link
      // await sendPasswordResetEmail(user.email, resetToken);
    }

    return res.status(200).json({
      success: true,
      message: 'If email exists, reset instructions have been sent'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid email format',
          details: error.errors
        }
      });
    }

    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Password reset failed'
      }
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Complete password reset with token
 */
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);

    // Verify reset token from in-memory store
    const tokenData = resetTokens.get(token);

    if (!tokenData) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired reset token'
        }
      });
    }

    // Check if token has expired
    if (tokenData.expires < new Date()) {
      resetTokens.delete(token); // Clean up expired token
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Reset token has expired'
        }
      });
    }

    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.id, tokenData.userId)
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, user.id));

    // Remove used token
    resetTokens.delete(token);

    return res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors
        }
      });
    }

    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Password reset failed'
      }
    });
  }
});

export default router;
