import { PrismaClient } from '@prisma/client';

// Single shared PrismaClient instance across the app.
// Creating one per request would exhaust the DB connection pool.
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

export default prisma;