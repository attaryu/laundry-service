import jwt from 'jsonwebtoken';

import nanoid from '../lib/customNanoid.js';
import propertyChecker from '../lib/propertyChecker.js';
import { serverError } from '../lib/responseReuse.js';
import {
  logTransaksi,
  paket,
  pelanggan,
  transaksi,
  user
} from '../models/index.js';
import { createClientService } from './client.service.js';

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
    id_paket: 'string',
  })

  if (propertyCorrect) {
    return propertyCorrect;
  }
  
  try {
    // check outlet
    const getOutlet: any = await user.findFirst({
      where: {
        id: token.id,
      },
      select: {
        id_outlet: true,
      }
    });

    // check price and package
    const selectedPackage = await paket.findFirst({
      where: {
        id: body.id_paket,
        id_outlet: getOutlet.id_outlet,
      },
      select: {
        harga: true,
      },
    });

    if (!selectedPackage) {
      return {
        code: 404,
        message: `paket dengan id ${body.id_paket} tidak di temukan pada outlet dengan id ${getOutlet.id_outlet}`,
      };
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

    // add discount
    const transactionCount = await transaksi.count({ where: { id_pelanggan: clientId } });
    let percentDiscount = 0.0;
    
    if (transactionCount >= 20) {
      percentDiscount = 20.0;
    } else if (transactionCount >= 15) {
      percentDiscount = 15.0;
    } else if (transactionCount >= 10) {
      percentDiscount = 10.0;
    } else if (transactionCount >= 5) {
      percentDiscount = 5.0;
    }

    const discount = (percentDiscount / 100) * selectedPackage.harga;
    const mustPay = selectedPackage.harga - discount;

    const transaction = await transaksi.create({
      data: {
        id: nanoid(),
        id_outlet: getOutlet.id_outlet,
        id_paket: body.id_paket,
        id_user: token.id,
        id_pelanggan: clientId,
        diskon: percentDiscount,
        total: mustPay,
      },
      select: {
        id: true,
        id_outlet: true,
        id_paket: true,
        id_pelanggan: true,
        kode_invoice: true,
        tanggal: true,
        status: true,
        lunas: true,
        diskon: true,
        total: true,
      },
    });

    await logTransaksi.create({
      data: {
        id_transaksi: transaction.id,
        id_user: token.id,
        id_outlet: transaction.id_outlet,
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
    id_paket: string,
    pelanggan: {
      nama?: string,
      alamat?: string,
      telepon?: string,
      jenis_kelamin?: 'laki_laki' | 'perempuan',
    }
  }
}

export async function cancelTransactionService({ requestToken, params }: cancelTransactionService) {
  // identify role
  const token: any = jwt.decode(requestToken);

  if (/manajer|admin/.test(token.role)) {
    return {
      code: 401,
      message: 'anda bukan kasir',
    };
  }
  
  try {
    const existingTransaction = await transaksi.findFirst({
      where: {
        kode_invoice: params.kode_invoice,
      },
      select: {
        id: true,
        id_outlet: true,
      }
    });

    if (!existingTransaction) {
      return {
        code: 404,
        message: `transaksi dengan kode invoice ${params.kode_invoice} tidak ditemukan`,
      }
    }

    const checkUser = await user.findFirst({
      where: {
        id: token.id,
        id_outlet: existingTransaction.id_outlet,
      },
    });

    if (!checkUser) {
      return {
        code: 401,
        message: `anda bukan kasir dari outlet ${existingTransaction.id_outlet}`,
      }
    }
    
    await transaksi.delete({
      where: {
        kode_invoice: params.kode_invoice,
      }
    });
    
    return {
      code: 200,
      message: `transaksi dengan kode invoice ${params.kode_invoice} berhasil dibatalkan`,
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

interface cancelTransactionService {
  requestToken: string,
  params: {
    kode_invoice: string,
  },
}

export async function paidOffTransactionService({ requestToken, params }: paidOffTransactionService) {
  // identify role
  const token: any = jwt.decode(requestToken);

  if (/manajer|admin/.test(token.role)) {
    return {
      code: 401,
      message: 'anda bukan kasir',
    };
  }

  if (!/paid_off|not_yet_paid_off/.test(params.paid_off)) {
    return {
      code: 400,
      message: 'parameter paid_off hanya boleh berisi \'paid_off\' dan \'not_yet_paid_off\'',
    }
  }

  try {
    const existingTransaction = await transaksi.findFirst({
      where: {
        kode_invoice: params.kode_invoice,
      },
      select: {
        id: true,
        id_outlet: true,
        lunas: true,
      }
    });

    if (!existingTransaction) {
      return {
        code: 404,
        message: `transaksi dengan kode invoice ${params.kode_invoice} tidak ditemukan`,
      }
    }

    const checkUser = await user.findFirst({
      where: {
        id: token.id,
        id_outlet: existingTransaction.id_outlet,
      },
    });

    if (!checkUser) {
      return {
        code: 401,
        message: `anda bukan kasir dari outlet ${existingTransaction.id_outlet}`,
      }
    }

    const lunas = params.paid_off === 'paid_off' ? true : false;
    const payload = await transaksi.update({
      where: {
        id: existingTransaction.id,
      },
      data: {
        lunas,
      },
      select: {
        id: true,
        kode_invoice: true,
        lunas: true,
      }
    });

    return {
      code: 200,
      message: `transaksi dengan kode invoice ${payload.kode_invoice} ${lunas ? 'lunas' : 'belum lunas'}`,
      payload
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

interface paidOffTransactionService {
  requestToken: string,
  params: {
    kode_invoice: string,
    paid_off: string,
  },
}

export async function changeStatusTransactionService({ requestToken, params, query }: changeStatusTransactionService) {
  // identify role
  const token: any = jwt.decode(requestToken);

  if (/manajer|admin/.test(token.role)) {
    return {
      code: 401,
      message: 'anda bukan kasir',
    };
  }

  if (!query.status) {
    return {
      code: 400,
      message: 'query status wajib dicantumkan',
    }
  }

  if (!/antrian|proses|selesai|diambil/.test(query.status)) {
    return {
      code: 400,
      message: 'query status hanya boleh berisi: antrian, proses, selesai, diambil',
    }
  }

  try {
    const existingTransaction = await transaksi.findFirst({
      where: {
        kode_invoice: params.kode_invoice,
      },
      select: {
        id: true,
        id_outlet: true,
      }
    });

    if (!existingTransaction) {
      return {
        code: 404,
        message: `transaksi dengan kode invoice ${params.kode_invoice} tidak ditemukan`,
      }
    }

    const checkUser = await user.findFirst({
      where: {
        id: token.id,
        id_outlet: existingTransaction.id_outlet,
      },
    });

    if (!checkUser) {
      return {
        code: 401,
        message: `anda bukan kasir dari outlet ${existingTransaction.id_outlet}`,
      }
    }

    const payload = await transaksi.update({
      where: {
        kode_invoice: params.kode_invoice,
      },
      data: {
        status: query.status,
      },
      select: {
        status: true,
      },
    });

    return {
      code: 200,
      message: `status transaksi dengan kode invoice ${params.kode_invoice} berhasil di ubah`,
      payload,
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

interface changeStatusTransactionService {
  requestToken: string,
  params: {
    kode_invoice: string,
  }
  query: {
    status: 'antrian' | 'proses' | 'selesai' | 'diambil' | undefined,
  },
}

export async function getAllTransactionService(query: getAllTransactionService) {
  let filter = {};

  if (!query.page) {
    return {
      code: 400,
      message: 'query page harus tercantum',
    }
  }

  if (query.id_outlet) {
    filter = {
      ...filter,
      id_outlet: query.id_outlet,
    }
  }

  if (query.status) {
    filter = {
      ...filter,
      status: query.status,
    }
  }

  if (query.lunas) {
    const bill = query.lunas === 'lunas' ? true : false;
    
    filter = {
      ...filter,
      lunas: bill,
    }
  }

  if (query.search) {
    filter = {
      OR: [
        {
          kode_invoice: {
            contains: query.search,
          },
        },
        {
          tb_pelanggan: {
            nama: query.search,
          }
        }
      ]
    }
  }
  
  try {
    const perPage = 10;
    const page = Number(query.page);
    const allData = await transaksi.count();
    const allPage = Math.ceil(allData / perPage);
    const payload = await transaksi.findMany({
      where: filter,
      select: {
        id: true,
        kode_invoice: true,
        lunas: true,
        status: true,
        tanggal: true,
        total: true,
        tb_outlet: {
          select: {
            id: true,
            nama: true,
          },
        },
        tb_pelanggan: {
          select: {
            id: true,
            nama: true,
          },
        },
        tb_paket: {
          select: {
            id: true,
            nama_paket: true,
          },
        },
      },
      orderBy: {
        tanggal: 'desc'
      },
      take: perPage,
      skip: (perPage * page) - perPage
    });

    if (page > allPage) {
      return {
        code: 400,
        message: `page ke-${query.page} tidak ada, hanya tersedia ${allPage} page`,
      }
    }

    return {
      code: 200,
      payload,
      page,
      per_page: perPage,
      all_page: allPage,
      total: allData,
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

interface getAllTransactionService {
  page: string
  id_outlet: string | undefined,
  status: 'antrian' | 'proses' | 'selesai' | 'diambil' | undefined,
  lunas: 'lunas' | 'belum_lunas',
  search: string,
}

export async function getSpecificTransactionService(params: getSpecificTransactionService) {
  if (!params.kode_invoice) {
    return {
      code: 400,
      message: 'parameter kode invoice harus di cantumkan',
    }
  }

  try {
    const payload = await transaksi.findFirst({
      where: {
        kode_invoice: params.kode_invoice,
      },
      select: {
        id: true,
        kode_invoice: true,
        status: true,
        lunas: true,
        tanggal: true,
        diskon: true,
        total: true,
        tb_pelanggan: {
          select: {
            id: true,
            nama: true,
            jenis_kelamin: true,
            alamat: true,
            telepon: true,
          },
        },
        tb_outlet: {
          select: {
            id: true,
            nama: true,
            alamat: true,
            telepon: true,
          },
        },
        tb_paket: {
          select: {
            id: true,
            nama_paket: true,
            harga: true,
            jenis: true,
          },
        },
        tb_user: {
          select: {
            id: true,
            name: true,
          }
        }
      },
    })

    if (!payload) {
      return {
        code: 404,
        message: `transaksi dengan kode invoice ${params.kode_invoice} tidak ditemukan`,
      }
    }

    return {
      code: 200,
      message: 'transaksi berhasil di temukan',
      payload,
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

interface getSpecificTransactionService {
  kode_invoice: string,
}
