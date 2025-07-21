import { PrismaClient } from '@prisma/client';
import { config } from './config';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  log: config.env === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

if (config.env !== 'production') {
  global.prisma = prisma;
}

// Middleware to log query execution time in development
if (config.env === 'development') {
  prisma.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();
    console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);
    return result;
  });
}

export default prisma; 