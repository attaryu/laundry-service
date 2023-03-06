import jwt from 'jsonwebtoken';

import { serverError } from '../lib/responseReuse.js';
import propertyChecker from '../lib/propertyChecker.js';
import { outlet, transaksi, user } from '../models/index.js';

export async function generateTransactionReportService({ requestToken, body }: generateTransactionReportService) {
  const token: any = jwt.decode(requestToken);

  if (/kasir/.test(token.role)) {
    return {
      code: 401,
      message: 'anda bukan admin atau manajer',
    }
  }

  const propertyCorrect = propertyChecker(body, {
    target: 'string',
  });

  if (propertyCorrect) {
    return propertyCorrect;
  }
  
  const propertyCorrect2 = propertyChecker(body.date, {
    from: 'string',
    until: 'string',
  })
  
  if (propertyCorrect2) {
    return propertyCorrect2;
  }

  try {
    let filter: any = {
      tanggal: {
        gte: body.date.from,
        lte: body.date.until,
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
    } else if (token.role === 'admin' && body.target !== 'all') {
      const existingOutlet = await outlet.findFirst({
        where: {
          id: body.target,
        },
      });

      if (!existingOutlet) {
        return {
          code: 404,
          message: `outlet dengan id ${body.target} tidak ditemukan`,
        }
      }
      
      filter = {
        ...filter,
        id_outlet: body.target,
      };
    }

    const payload = await transaksi.findMany({
      where: filter,
      select: {
        id: true,
        id_outlet: true,
        id_user: true,
        id_paket: true,
        id_pelanggan: true,
        kode_invoice: true,
        status: true,
        diskon: true,
        total: true,
        lunas: true,
        tanggal: true,
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
  body: {
    target: string | 'all',
    date: {
      from: string,
      until: string,
    }
  },
}
