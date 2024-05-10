import jwt from 'jsonwebtoken';

import nanoid from '../lib/customNanoid.js';
import propertyChecker from '../lib/propertyChecker.js';
import { serverError } from '../lib/responseReuse.js';
import { logOutlet, outlet, transaksi, user } from '../models/index.js';

export async function createOutletService(requestToken: string, body: any) {
  const token: any = jwt.decode(requestToken);

  if (/manajer|kasir/.test(token.role)) {
    return {
      code: 401,
      message: 'anda bukan admin',
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

  try {
    const existingOutlet: any | null = await outlet.findFirst({
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

    if (existingOutlet) {
      if (body.nama === existingOutlet.nama) {
        return {
          code: 400,
          message: `outlet dengan nama ${body.nama} sudah ada, silahkan coba nama lain`,
        };
      } else if (body.alamat === existingOutlet.alamat) {
        return {
          code: 400,
          message: `outlet dengan alamat ${body.alamat} sudah ada, silahkan coba alamat lain`,
        };
      } else if (body.telepon === existingOutlet.telepon) {
        return {
          code: 400,
          message: `outlet dengan telepon ${body.telepon} sudah ada, silahkan coba telepon lain`,
        };
      }
    }
    
    const payload = await outlet.create({
      data: {
        id: nanoid(),
        nama: body.nama,
        alamat: body.alamat,
        telepon: body.telepon,
      },
      select: {
        id: true,
        nama: true,
        alamat: true,
        telepon: true,
      },
    })

    await logOutlet.create({
      data: {
        id_user: token.id,
        id_outlet: payload.id,
        action: 'tambah'
      }
    })

    return {
      code: 201,
      message: `outlet baru berhasil ditambahkan`,
      payload
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

export async function getAllOutletService(query: any) {
  let filter = {};

  if (!query.page) {
    return {
      code: 400,
      message: 'query page harus tercantum',
    }
  }

  if (query.search) {
    filter = {
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
    };
  }

  try {
    const perPage = 10;
    const page = Number(query.page);
    const allData = await outlet.count();
    const allPage = Math.ceil(allData / perPage);

    if (query.page > allPage) {
      return {
        code: 400,
        message: `page ke-${query.page} tidak ada, hanya tersedia ${allPage} page`,
      }
    }

    const payload = await outlet.findMany({
      where: filter,
      select: {
        id: true,
        nama: true,
        alamat: true,
        telepon: true,
      },
      take: perPage,
      skip: (perPage * page) - perPage,
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

export async function getSpecificOutletService(params: any) {
  try {
    const transactionCount = await transaksi.count({ where: { id_outlet: params.outletId } });
    const cashierCount = await user.count({
      where: {
        id_outlet: params.outletId,
        role: 'kasir',
      }
    });

    const managerCount = await user.count({
      where: {
        id_outlet: params.outletId,
        role: 'manajer',
      }
    });

    const payload = await outlet.findUnique({
      where: {
        id: params.outletId,
      },
      select: {
        id: true,
        nama: true,
        alamat: true,
        telepon: true,
        tb_user: {
          where: {
            NOT: {
              role: 'admin',
            },
          },
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
          },
        },
        tb_transaksi: {
          take: 3,
          orderBy: {
            tanggal: 'desc',
          },
          select: {
            id: true,
            total: true,
            tanggal: true,
            kode_invoice: true,
          }
        },
        tb_paket: {
          select: {
            id: true,
            jenis: true,
            harga: true,
            nama_paket: true,
          },
        },
      }
    });

    if (!payload) {
      return {
        code: 404,
        message: `outlet dengan id ${params.outletId} tidak ditemukan`,
      };
    }
    
    return {
      code: 200,
      payload: {
        ...payload,
        jumlah_transaksi: transactionCount,
        jumlah_kasir: cashierCount,
        jumlah_manajer: managerCount,
      }
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

export async function editOutletService(requestToken: string, body: any, params: any) {
  const token: any = jwt.decode(requestToken);

  if (/kasir/.test(token.role)) {
    return {
      code: 401,
      message: 'anda bukan admin atau manajer',
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

  try {
    const checkId = await outlet.findUnique({ where: { id: params.outletId } });

    if (!checkId) {
      return {
        code: 404,
        message: `outlet dengan id ${params.outletId} tidak terdaftar`,
      }
    }
    
    const existingOutlet: any | null = await outlet.findFirst({
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
        ],
        NOT: [
          {
            id: params.outletId,
          }
        ]
      },
      select: {
        id: true,
        nama: true,
        alamat: true,
        telepon: true,
      },
    });

    if (existingOutlet) {
      if (body.nama === existingOutlet.nama) {
        return {
          code: 400,
          message: `outlet dengan nama ${body.nama} sudah ada, silahkan coba nama lain`,
        };
      } else if (body.alamat === existingOutlet.alamat) {
        return {
          code: 400,
          message: `outlet dengan alamat ${body.alamat} sudah ada, silahkan coba alamat lain`,
        };
      } else if (body.telepon === existingOutlet.telepon) {
        return {
          code: 400,
          message: `outlet dengan telepon ${body.telepon} sudah ada, silahkan coba telepon lain`,
        };
      }
    }
    
    const payload = await outlet.update({
      where: {
        id: params.outletId,
      },
      data: {
        nama: body.nama,
        alamat: body.alamat,
        telepon: body.telepon,
      },
      select: {
        id: true,
        nama: true,
        alamat: true,
        telepon: true,
      }
    })

    await logOutlet.create({
      data: {
        id_user: token.id,
        id_outlet: params.outletId,
        action: 'edit',
      }
    })

    return {
      code: 200,
      message: `outlet dengan id ${params.outletId} sudah di update`,
      payload,
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

export async function deleteOutletService({ requestToken, params }: any) {
  const token: any = jwt.decode(requestToken);

  if (/manajer|kasir/.test(token.role)) {
    return {
      code: 401,
      message: 'anda bukan admin',
    };
  }

  try {
    const existingOutlet: any | null = await outlet.findUnique({
      where: {
        id: params.outletId,
      },
      select: {
        id: true,
      },
    });

    if (!existingOutlet) {
      return {
        code: 404,
        message: `outlet dengan id ${params.outletId} tidak terdaftar`,
      };
    }

    await outlet.delete({ where: { id: params.outletId }});

    await logOutlet.create({
      data: {
        id_user: token.id,
        id_outlet: params.outletId,
        action: 'tambah'
      }
    })

    return {
      code: 200,
      message: `outlet dengan id ${params.outletId} berhasil di hapus`,
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

export async function getNameOutletService() {
  try {
    const payload = await outlet.findMany({
      select: {
        id: true,
        nama: true,
      }
    });

    return {
      code: 200,
      payload,
    }
  } catch (error) {
    console.log(error);

    return serverError();
  }
}
