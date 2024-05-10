import jwt from 'jsonwebtoken';

import { serverError } from '../lib/responseReuse.js';
import { outlet, transaksi, user } from '../models/index.js';

export async function generateTransactionReportService({ requestToken, query }: generateTransactionReportService) {
  const token: any = jwt.decode(requestToken);

  if (/kasir/.test(token.role)) {
    return {
      code: 401,
      message: 'anda bukan admin atau manajer',
    }
  }

  try {
    let filter: any = {
      tanggal: {
        gte: new Date(query.dateFrom),
        lte: new Date(query.dateUntil),
      }
    }
    
    if (token.role === 'manajer') {
      const existingUser = await user.findFirst({
        where: {
          id: token.id,
        },
        select: {
          id_outlet: true,
        },
      });

      if (!existingUser) {
        return {
          code: 404,
          message: 'anda bukan manajer',
        }
      }
      
      filter = {
        ...filter,
        id_outlet: existingUser.id_outlet,
      };
    } else if (token.role === 'admin' && query.target !== 'all') {
      const existingOutlet = await outlet.findFirst({
        where: {
          id: query.target,
        },
      });

      if (!existingOutlet) {
        return {
          code: 404,
          message: `outlet dengan id ${query.target} tidak ditemukan`,
        }
      }
      
      filter = {
        ...filter,
        id_outlet: query.target,
      };
    }

    const payload = await transaksi.findMany({
      where: filter,
      select: {
        id: true,
        kode_invoice: true,
        total: true,
        tanggal: true,
        diskon: true,
        lunas: true,
        tb_pelanggan: {
          select: {
            nama: true,
          },
        },
        tb_outlet: {
          select: {
            nama: true,
          },
        },
        tb_paket: {
          select: {
            nama_paket: true,
          }
        }
      },
      orderBy: {
        tanggal: 'desc'
      }
    });

    return {
      code: 200,
      message: 'berhasil mengambil data laporan',
      payload,
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

interface generateTransactionReportService {
  requestToken: string,
  query: {
    target: string | 'all',
    dateFrom: string,
    dateUntil: string,
  },
}
