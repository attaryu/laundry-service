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
  const filter: { [index: string]: any } = {};

  if (!query.page) {
    return {
      code: 400,
      message: 'query page harus tercantum',
    }
  }

  function queryMaker(raw: Omit<Filter, 'type'>) {
    const result: { [index: string]: any } = {};
    const isOrIsNot = <T>(value: T) => raw.equals === 'IS' ? value : { not: value };

    switch (typeof raw.value) {
      case 'string':
      case 'number':
      case 'boolean':
        result[raw.attribute] = isOrIsNot(raw.value);
        break;
      default:
        if ('min' in raw.value && 'max' in raw.value) {
          result[raw.attribute] = isOrIsNot({
            gte: raw.attribute === 'tanggal' ? new Date(raw.value.min) : raw.value.min,
            lte: raw.attribute === 'tanggal' ? new Date(raw.value.max) : raw.value.max,
          });
        } else if ('min' in raw.value) {
          result[raw.attribute] = isOrIsNot({
            gte: raw.attribute === 'tanggal' ? new Date(raw.value.min) : raw.value.min,
          });
        } else {
          result[raw.attribute] = isOrIsNot({
            lte: raw.attribute === 'tanggal' ? new Date(raw.value.max) : raw.value.max,
          });
        }
    }

    return result;
  }

  const body: getAllTransactionService['filter'] = query.filter ? JSON.parse(query.filter as any) : false;

  if (body) {
    body.filter.forEach((rawFilter) => {
      if (body.operator) {
        if (body.operator === 'AND') {
          if (rawFilter.type === 'FILTER') {
            filter[rawFilter.attribute] = queryMaker(rawFilter)[rawFilter.attribute];

          } else {
            if (!('AND' in filter)) {
              filter.AND = [];
            }
            
            const temporaryQuery: { [index: string]: any } = {};
            
            rawFilter.filter.forEach((rawSubFilter) => {
              if (rawFilter.operator === 'AND') {
                temporaryQuery[rawSubFilter.attribute] = queryMaker(rawSubFilter)[rawSubFilter.attribute];
              } else {
                if (!('OR' in temporaryQuery)) {
                  temporaryQuery.OR = [];
                }

                temporaryQuery.OR.push(queryMaker(rawSubFilter));
              }
            });

            filter.AND.push(temporaryQuery);
          }

        } else {
          if (!('OR' in filter)) {
            filter.OR = [];
          }

          if (rawFilter.type === 'FILTER') {
            filter.OR.push(queryMaker(rawFilter));

          } else {
            const temporaryQuery: { [index: string]: any } = {};
            
            rawFilter.filter.forEach((rawSubFilter) => {
              if (rawFilter.operator === 'AND') {
                temporaryQuery[rawSubFilter.attribute] = queryMaker(rawSubFilter)[rawSubFilter.attribute];
              } else {
                if (!('OR' in temporaryQuery)) {
                  temporaryQuery.OR = [];
                }

                temporaryQuery.OR.push(queryMaker(rawSubFilter));
              }
            });

            filter.OR.push(temporaryQuery);
          }
        }
      } else {
        /**
         * * branch ini akan di jalankan jika nilai operator null dan sudah pasti hanya 1 query atau subquery
         */

        if (rawFilter.type === 'FILTER') {
          filter[rawFilter.attribute] = queryMaker(rawFilter)[rawFilter.attribute];

        } else {
          rawFilter.filter.forEach((rawSubFilter) => {
            if (rawFilter.operator === 'AND' || rawFilter.operator === null) {
              filter[rawSubFilter.attribute] = queryMaker(rawSubFilter)[rawSubFilter.attribute];

            } else {
              if (!('OR' in filter)) {
                filter.OR = [];
              }

              filter.OR.push(queryMaker(rawSubFilter));
            }
          });
        }
      }
    });
  } 

  if (query.search) {
    filter.OR.push(
      {
        kode_invoice: {
          contains: query.search,
        },
      },
      {
        tb_pelanggan: {
          nama: query.search,
        },
      }
    );
  }
  
  try {
    const perPage = 10;
    const page = Number(query.page);
    const allData = await transaksi.count({ where: filter });
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

    if (page > allPage && (body === null || body === undefined)) {
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

type Filter = {
  type: 'FILTER',
  attribute: string,
  value: string
    | number
    | boolean
    | {
      min: number | Date,
      max: number | Date
    } | {
      min: number | Date,
    } | {
      max: number | Date
    },
  equals: 'IS' | 'IS_NOT',
}

type SubFilter = {
  type: 'SUB_FILTER',
  operator: 'AND' | 'OR',
  filter: Array<Omit<Filter, 'type'>>
}

interface getAllTransactionService {
  page: string,
  search: string,
  filter: {
    operator: 'AND' | 'OR' | null,
    filter: Array<Filter | SubFilter>,
  },
};

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
