import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

prisma.$connect().then(() => console.log('Database connected'));

export const {
  outlet,
  paket,
  transaksi,
  user,
  userAuth,
  logUser,
  logTransaksi,
  logOutlet,
  pelanggan,
  logPelanggan,
  surat,
  logSurat
} = prisma;