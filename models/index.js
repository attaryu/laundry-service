const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

prisma.$connect().then(() => console.log('Database connected'));

module.exports = {
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