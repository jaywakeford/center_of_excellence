import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { prisma } from '../config/database';

interface SocketUser {
  userId: string;
  email: string;
  socketId: string;
}

class SocketService {
  private io: Server | null = null;
  private connectedUsers: Map<string, SocketUser> = new Map();

  initialize(io: Server) {
    this.io = io;

    // Authentication middleware
    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, config.jwt.secret) as { userId: string; email: string };
        
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
        });

        if (!user || !user.isActive) {
          return next(new Error('User not found or inactive'));
        }

        // Attach user data to socket
        (socket as any).userId = user.id;
        (socket as any).userEmail = user.email;

        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });

    // Connection handler
    io.on('connection', (socket: Socket) => {
      const userId = (socket as any).userId;
      const userEmail = (socket as any).userEmail;

      console.log(`User ${userEmail} connected`);

      // Store connected user
      this.connectedUsers.set(userId, {
        userId,
        email: userEmail,
        socketId: socket.id,
      });

      // Join user-specific room
      socket.join(`user:${userId}`);

      // Handle joining rooms
      socket.on('join:room', (roomName: string) => {
        socket.join(roomName);
        console.log(`User ${userEmail} joined room: ${roomName}`);
      });

      // Handle leaving rooms
      socket.on('leave:room', (roomName: string) => {
        socket.leave(roomName);
        console.log(`User ${userEmail} left room: ${roomName}`);
      });

      // Handle real-time notifications
      socket.on('notification:mark-read', async (notificationId: string) => {
        try {
          await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true, readAt: new Date() },
          });
        } catch (error) {
          console.error('Error marking notification as read:', error);
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User ${userEmail} disconnected`);
        this.connectedUsers.delete(userId);
      });
    });
  }

  // Send notification to specific user
  sendToUser(userId: string, event: string, data: any) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, data);
    }
  }

  // Send to specific room
  sendToRoom(room: string, event: string, data: any) {
    if (this.io) {
      this.io.to(room).emit(event, data);
    }
  }

  // Broadcast to all connected users
  broadcast(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  // Get connected users
  getConnectedUsers(): SocketUser[] {
    return Array.from(this.connectedUsers.values());
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}

export const socketService = new SocketService(); 