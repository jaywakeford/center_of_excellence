import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { config } from '../config/config';
import { prisma } from '../config/database';

export const authService = {
  // Generate access and refresh tokens
  async generateTokens(userId: string, email: string) {
    const accessToken = jwt.sign(
      { userId, email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    const refreshToken = jwt.sign(
      { userId, email },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );

    return { accessToken, refreshToken };
  },

  // Save user session
  async saveSession(
    userId: string,
    token: string,
    refreshToken: string,
    req: Request
  ) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.userSession.create({
      data: {
        userId,
        token,
        refreshToken,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'] || null,
        expiresAt,
      },
    });
  },

  // Generate password reset token
  async generatePasswordResetToken(userId: string) {
    const resetToken = jwt.sign(
      { userId, type: 'password-reset' },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    return resetToken;
  },

  // Clean expired sessions
  async cleanExpiredSessions() {
    const result = await prisma.userSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  },

  // Get user sessions
  async getUserSessions(userId: string) {
    const sessions = await prisma.userSession.findMany({
      where: { userId },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return sessions;
  },

  // Validate session
  async validateSession(token: string) {
    const session = await prisma.userSession.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });

    if (!session || new Date() > session.expiresAt) {
      return null;
    }

    return session;
  },
}; 