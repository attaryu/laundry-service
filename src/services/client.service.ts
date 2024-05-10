import jwt from 'jsonwebtoken';

import nanoid from '../lib/customNanoid.js';
import propertyChecker from '../lib/propertyChecker.js';
import { serverError } from '../lib/responseReuse.js';
import { logPelanggan, pelanggan, transaksi } from '../models/index.js';

export async function createClientService(requestToken: string, body: any) {
  const token: any = jwt.decode(requestToken);

  if (/manajer|admin/.test(token.role)) {
    return {
      code: 401,
      message: 'anda bukan kasir',
    };
  }

  let propertyCorrection: any = propertyChecker(body, {
    nama: 'string',
    alamat: 'string',
    jenis_kelamin: 'string',
    telepon: 'string',
  });

  if (propertyCorrection) {
    return propertyCorrection;
  }

  if (/[^laki_laki|perempuan]/.test(body.jenis_kelamin)) {
    return {
      code: 400,
      message: `jenis kelamin ${body.jenis_kelamin} tidak valid`,
    }
  }

  try {
    const existingClient = await pelanggan.findFirst({
      where: {
        OR: [
          {
            nama: body.nama,
          },
          {
            alamat: body.alamat,
          },
          {
            telepon: body.telepon,
          },
        ]
      },
      select: {
        id: true,
        nama: true,
        alamat: true,
        telepon: true,
      },
    });

    if (existingClient) {
      if (body.nama === existingClient.nama) {
        return {
          code: 400,
          message: `pelanggan dengan nama ${body.nama} sudah ada, silahkan coba nama lain`,
        };
      } else if (body.telepon === existingClient.telepon) {
        return {
          code: 400,
          message: `pelanggan dengan telepon ${body.telepon} sudah ada, silahkan coba telepon lain`,
        };
      }
    }
    
    const payload = await pelanggan.create({
      data: {
        id: nanoid(),
        nama: body.nama,
        alamat: body.alamat,
        jenis_kelamin: body.jenis_kelamin,
        telepon: body.telepon,
      },
      select: {
        id: true,
        nama: true,
        jenis_kelamin: true,
        alamat: true,
        telepon: true,
      },
    })

    await logPelanggan.create({
      data: {
        id_user: token.id,
        id_pelanggan: payload.id,
        action: 'tambah'
      }
    })

    return {
      code: 201,
      message: `pelanggan baru berhasil ditambahkan`,
      payload
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

export async function getAllClientService(query: any) {
  const filter: any = {
    AND: [],
  };

  if (!query.page) {
    return {
      code: 400,
      message: 'query page harus tercantum',
    }
  }

  
  if (query.gender) {
    if (!/laki_laki|perempuan/.test(query.gender)) {
      return {
        code: 400,
        message: `jenis kelamin ${query.gender} tidak valid`,
      }
    }

    filter.AND.push({
      jenis_kelamin: query.gender,
    });
  }

  if (query.search) {
    filter.AND.push({
      OR: [
        {
          nama: {
            contains: query.search,
          },
        },
        {
          alamat: {
            contains: query.search,
          },
        },
        {
          telepon: {
            contains: query.search,
          },
        }
      ]
    });
  }

  try {
    const perPage = 10;
    const page = Number(query.page);
    const allData = await pelanggan.count();
    const allPage = Math.ceil(allData / perPage);

    if (query.page > allPage) {
      return {
        code: 400,
        message: `page ke-${query.page} tidak ada, hanya tersedia ${allPage} page`,
      }
    }

    const payload = await pelanggan.findMany({
      where: filter,
      select: {
        id: true,
        nama: true,
        alamat: true,
        telepon: true,
        jenis_kelamin: true,
      },
      take: perPage,
      skip: (perPage * page) - perPage
    });
    

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

export async function getSpecificClientService(params: any) {
  try {
    const transactionCount = await transaksi.count({ where: { id_pelanggan: params.customerId } });
    const payload = await pelanggan.findUnique({
      where: {
        id: params.customerId,
      },
      select: {
        id: true,
        nama: true,
        jenis_kelamin: true,
        telepon: true,
        alamat: true,
        transaksi: {
          take: 3,
          orderBy: {
            tanggal: 'desc',
          },
          select: {
            id: true,
            kode_invoice: true,
            total: true,
            tanggal: true,
          }
        }
      }
    });

    if (!payload) {
      return {
        code: 404,
        message: `pelanggan dengan id ${params.customerId} tidak ditemukan`,
      };
    }
    
    return {
      code: 200,
      payload: {
        ...payload,
        jumlah_transaksi: transactionCount,
      }
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

export async function editClientService(requestToken: string, body: any, params: any) {
  const token: any = jwt.decode(requestToken);

  if (/manajer/.test(token.role)) {
    return {
      code: 401,
      message: 'anda bukan kasir atau admin',
    };
  }

  let propertyCorrection: any = propertyChecker(body, {
    nama: 'string',
    alamat: 'string',
    telepon: 'string',
  });

  if (propertyCorrection) {
    return propertyCorrection;
  }

  if (!/laki_laki|perempuan/.test(body.jenis_kelamin)) {
    return {
      code: 400,
      message: `jenis kelamin ${body.jenis_kelamin} tidak valid`,
    }
  }

  try {
    const checkId = await pelanggan.findUnique({ where: { id: params.customerId } });

    if (!checkId) {
      return {
        code: 404,
        message: `pelanggan dengan id ${params.customerId} tidak terdaftar`,
      }
    }
    
    const existingClient = await pelanggan.findFirst({
      where: {
        OR: [
          {
            nama: body.nama,
          },
          {
            alamat: body.alamat,
          },
          {
            telepon: body.telepon,
          },
        ]
      },
      select: {
        id: true,
        nama: true,
        alamat: true,
        telepon: true,
      },
    });

    if (existingClient && existingClient.id !== params.customerId) {
      if (body.nama === existingClient.nama) {
        return {
          code: 400,
          message: `pelanggan dengan nama ${body.nama} sudah ada, silahkan coba nama lain`,
        };
      } else if (body.alamat === existingClient.alamat) {
        return {
          code: 400,
          message: `pelanggan dengan alamat ${body.alamat} sudah ada, silahkan coba alamat lain`,
        };
      } else if (body.telepon === existingClient.telepon) {
        return {
          code: 400,
          message: `pelanggan dengan telepon ${body.telepon} sudah ada, silahkan coba telepon lain`,
        };
      }
    }
    
    const payload = await pelanggan.update({
      where: {
        id: params.customerId,
      },
      data: {
        nama: body.nama,
        alamat: body.alamat,
        telepon: body.telepon,
        jenis_kelamin: body.jenis_kelamin,
      },
      select: {
        id: true,
        nama: true,
        jenis_kelamin: true,
        telepon: true,
        alamat: true,
      }
    })

    await logPelanggan.create({
      data: {
        id_user: token.id,
        id_pelanggan: params.customerId,
        action: 'edit',
      }
    })

    return {
      code: 200,
      message: `pelanggan dengan id ${params.customerId} sudah di update`,
      payload,
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

export async function deleteClientService({ requestToken, params }: any) {
  const token: any = jwt.decode(requestToken);

  if (/manajer/.test(token.role)) {
    return {
      code: 401,
      message: 'anda bukan kasir atau admin',
    };
  }

  try {
    const existingClient: any | null = await pelanggan.findUnique({
      where: {
        id: params.customerId,
      },
      select: {
        id: true,
      },
    });

    if (!existingClient) {
      return {
        code: 404,
        message: `pelanggan dengan id ${params.customerId} tidak terdaftar`,
      };
    }

    await pelanggan.delete({ where: { id: params.customerId }});

    await logPelanggan.create({
      data: {
        id_user: token.id,
        id_pelanggan: params.customerId,
        action: 'tambah'
      }
    })

    return {
      code: 200,
      message: `pelanggan dengan id ${params.customerId} berhasil di hapus`,
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

export async function getNameClientService() {
  try {
    const payload = await pelanggan.findMany({ select: { id: true, nama: true } });
    
    return {
      code: 200,
      payload,
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}
