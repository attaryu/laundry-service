import jwt from 'jsonwebtoken';

import { serverError } from '../lib/responseReuse.js';
import {
  logTransaksi,
  outlet,
  paket,
  pelanggan,
  transaksi,
} from '../models/index.js';
import { createClientService } from './client.service.js';
import propertyChecker from '../lib/propertyChecker.js';

export async function createTransactionService({ requestToken, body }: createTransaction) {
  // identify role
  const token: any = jwt.decode(requestToken);

  if (/manajer|admin/.test(token.role)) {
    return {
      code: 401,
      message: 'anda bukan kasir',
    };
  }

  const propertyCorrect = propertyChecker(body, {
    keterangan: 'string',
    id_paket: 'string',
    id_outlet: 'string',
  })

  if (propertyCorrect) {
    return propertyCorrect;
  }
  
  try {
    // check outlet
    const existingOutlet = await outlet.findUnique({ where: { id: body.id_outlet } });

    if (!existingOutlet) {
      return {
        code: 404,
        message: `outlet dengan id ${body.id_outlet} tidak ditemukan`,
      }
    }
    
    // check user
    const checkNameClient = await pelanggan.findFirst({
      where: {
        nama: body.pelanggan.nama,
      },
      select: {
        id: true,
      }
    });

    let clientId;
  
    if (!checkNameClient) {
      const payloads = await createClientService(requestToken, body.pelanggan);

      if (!('payload' in payloads)) {
        return payloads;
      }

      clientId = payloads.payload.id;
    } else {
      const takeClientId = await pelanggan. findFirst({
        where: {
          nama: body.pelanggan.nama,
        },
        select: {
          id: true,
        }
      });

      if (takeClientId) {
        clientId = takeClientId.id;
      }
    }

    // check price
    const selectedPackage = await paket.findFirst({
      where: {
        id: body.id_paket,
      },
      select: {
        harga: true,
      },
    });

    if (!selectedPackage) {
      return {
        code: 404,
        message: `paket dengan id ${body.id_paket} tidak di temukan`,
      };
    }

    // add discount
    const transactionCount = await transaksi.count({ where: { id_pelanggan: clientId } });
    let percentDiscount = 0.0;

    if (transactionCount > 5) {
      percentDiscount = 5.0;
    } else if (transactionCount > 10) {
      percentDiscount = 10.0;
    } else if (transactionCount > 15) {
      percentDiscount = 15.0;
    } else if (transactionCount > 20) {
      percentDiscount = 20.0;
    }

    const discount = (percentDiscount / 100) * selectedPackage.harga;
    const mustPay = selectedPackage.harga - discount;
    
    // check additional value
    let data = {};

    if (body.keterangan) {
      data = {
        keterangan: body.keterangan,
      }
    }

    const transaction = await transaksi.create({
      data: {
        ...data,
        id_outlet: body.id_outlet,
        id_paket: body.id_paket,
        id_user: token.id,
        id_pelanggan: clientId,
        diskon: discount,
        total: mustPay,
      },
      select: {
        id: true,
        kode_invoice: true,
      },
    });

    await logTransaksi.create({
      data: {
        id_transaksi: transaction.id,
        id_user: token.id,
      }
    });

    return {
      code: 201,
      message: 'transaksi berhasil dibuat',
      payload: transaction,
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

interface createTransaction {
  requestToken: string,
  body: {
    keterangan: string
    id_paket: string,
    id_outlet: string,
    pelanggan: {
      id?: string,
      nama?: string,
      alamat?: string,
      telepon?: string,
      jenis_kelamin?: 'laki_laki' | 'perempuan',
    }
  }
}