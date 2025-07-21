import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { authService } from '../services/auth.service';

export const authController = {
  // Register new user
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName, department, jobTitle, phoneNumber } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new AppError('Email already registered', 400);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          department,
          jobTitle,
          phoneNumber,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          department: true,
          jobTitle: true,
          createdAt: true,
        },
      });

      // Assign default role
      const defaultRole = await prisma.role.findUnique({
        where: { name: 'user' },
      });

      if (defaultRole) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: defaultRole.id,
          },
        });
      }

      // Generate tokens
      const { accessToken, refreshToken } = await authService.generateTokens(user.id, user.email);

      // Save session
      await authService.saveSession(user.id, accessToken, refreshToken, req);

      res.status(201).json({
        success: true,
        data: {
          user,
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Login user
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Find user with roles
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user || !user.isActive) {
        throw new AppError('Invalid credentials', 401);
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new AppError('Invalid credentials', 401);
      }

      // Generate tokens
      const { accessToken, refreshToken } = await authService.generateTokens(user.id, user.email);

      // Save session
      await authService.saveSession(user.id, accessToken, refreshToken, req);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: {
          user: userWithoutPassword,
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Refresh access token
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError('Refresh token required', 401);
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { userId: string; email: string };

      // Check if session exists
      const session = await prisma.userSession.findFirst({
        where: {
          refreshToken,
          userId: decoded.userId,
        },
      });

      if (!session) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Check if session is expired
      if (new Date() > session.expiresAt) {
        await prisma.userSession.delete({ where: { id: session.id } });
        throw new AppError('Refresh token expired', 401);
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { userId: decoded.userId, email: decoded.email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.json({
        success: true,
        data: {
          accessToken,
        },
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return next(new AppError('Invalid refresh token', 401));
      }
      next(error);
    }
  },

  // Logout user
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (token) {
        // Delete session
        await prisma.userSession.deleteMany({
          where: {
            token,
            userId: req.user!.id,
          },
        });
      }

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Get current user
  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          department: true,
          jobTitle: true,
          phoneNumber: true,
          avatar: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  // Change password
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.id;

      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        throw new AppError('Current password is incorrect', 401);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      // Invalidate all sessions except current
      const currentToken = req.headers.authorization?.split(' ')[1];
      await prisma.userSession.deleteMany({
        where: {
          userId,
          NOT: { token: currentToken },
        },
      });

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Forgot password
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Don't reveal if user exists
        res.json({
          success: true,
          message: 'If the email exists, a password reset link has been sent',
        });
        return;
      }

      // Generate reset token
      const resetToken = await authService.generatePasswordResetToken(user.id);

      // In production, send email with reset link
      // For now, just return the token
      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
        ...(config.env === 'development' && { resetToken }),
      });
    } catch (error) {
      next(error);
    }
  },

  // Reset password
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;

      // Verify reset token
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: string; type: string };

      if (decoded.type !== 'password-reset') {
        throw new AppError('Invalid reset token', 400);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Update password
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { password: hashedPassword },
      });

      // Invalidate all sessions
      await prisma.userSession.deleteMany({
        where: { userId: decoded.userId },
      });

      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return next(new AppError('Invalid or expired reset token', 400));
      }
      next(error);
    }
  },
}; 