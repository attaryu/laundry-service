import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

prisma.$connect().then(() => console.log('Database connected'));

export const {
  detailTransaksi,
  member,
  outlet,
  paket,
  transaksi,
  user,
  userAuth,
} = prisma;