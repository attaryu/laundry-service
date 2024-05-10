import jwt from 'jsonwebtoken';

import nanoid from '../lib/customNanoid.js';
import propertyChecker from '../lib/propertyChecker.js';
import { serverError } from '../lib/responseReuse.js';
import { paket, user } from '../models/index.js';

export async function createPackageService({ requestToken, body }: createPackageService) {
  // identify role
  const token: any = jwt.decode(requestToken);

  if (/kasir|admin/.test(token.role)) {
    return {
      code: 401,
      message: 'anda bukan manajer',
    };
  }

  const propertyCorrect: any = propertyChecker(body, {
    id_outlet: 'string',
    nama_paket: 'string',
    jenis: 'string',
    harga: 'number',
  });

  if (propertyCorrect) {
    return propertyCorrect;
  }

  if (!/kiloan|selimut|bed_cover|kaos/.test(body.jenis)) {
    return {
      code: 400,
      message: `jenis paket ${body.jenis} tidak terdaftar`,
    }
  }
  
  try {
    const existingPaket: any | null = await paket.findFirst({
      where: {
        id_outlet: body.id_outlet,
        nama_paket: body.nama_paket,
      },
      select: {
        nama_paket: true,
      },
    });

    if (existingPaket && body.nama_paket === existingPaket.nama_paket) {
      return {
        code: 400,
        message: `paket dengan nama paket ${body.nama_paket} sudah ada, silahkan coba nama paket lain`,
      }
    }

    const payload = await paket.create({
      data: {
        id: nanoid(),
        ...body,
      },
      select: {
        id: true,
        harga: true,
        id_outlet: true,
        nama_paket: true,
        jenis: true,
      }
    });

    return {
      code: 201,
      message: `paket dengan id ${payload.id} sudah terdaftar pada outlet dengan id ${payload.id_outlet}`,
      payload,
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

interface createPackageService {
  requestToken: string,
  body: {
    id_outlet: string,
    nama_paket: string,
    jenis: 'kiloan' | 'selimut' | 'bed_cover' | 'kaos',
    harga: number,
  },
}

export async function getAllPackageService(query: any) {
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

  if (query.jenis) {
    filter = {
      ...filter,
      jenis: query.jenis,
    }
  }
  
  if (query.search) {
    filter = {
      ...filter,
      nama_paket: {
        contains: query.search,
      },
    };
  }

  try {
    const perPage = 10;
    const page = Number(query.page);
    const allData = await paket.count();
    const allPage = Math.ceil(allData / perPage);
    const payload = await paket.findMany({
      where: filter,
      select: {
        id: true,
        nama_paket: true,
        jenis: true,
        harga: true,
        tb_outlet: {
          select: {
            id: true,
            nama: true,
          }
        }
      },
      take: perPage,
      skip: (perPage * page) - perPage
    });

    if (query.page > allPage) {
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

export async function getSpecificPackageService(params: any) {
  try {
    const payload = await paket.findFirst({
      where: { id: params.paketId },
      select: {
        id: true,
        nama_paket: true,
        jenis: true,
        harga: true,
      }
    });

    if (!payload) {
      return {
        code: 404,
        message: `paket dengan id ${params.paketId} tidak ditemukan`
      }
    }

    return {
      code: 200,
      payload,
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

export async function editPackageService(requestToken: string, body: any, params: any) {
  const token: any = jwt.decode(requestToken);

  if (/kasir/.test(token.role)) {
    return {
      code: 401,
      message: 'anda bukan manajer atau admin',
    };
  }

  let propertyCorrection: any = propertyChecker(body, {
    nama_paket: 'string',
    jenis: 'string',
    harga: 'number',
  });

  if (propertyCorrection) {
    return propertyCorrection;
  }

  try {
    const checkId = await paket.findUnique({ where: { id: params.paketId } });

    if (!checkId) {
      return {
        code: 404,
        message: `paket dengan id ${params.paketId} tidak terdaftar`,
      }
    }
    
    const payload = await paket.update({
      where: {
        id: params.paketId,
      },
      data: {
        nama_paket: body.nama_paket,
        jenis: body.jenis,
        harga: body.harga,
      },
      select: {
        id: true,
        nama_paket: true,
        jenis: true,
        harga: true,
      }
    })

    return {
      code: 200,
      message: `paket dengan id ${params.paketId} sudah di update`,
      payload,
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

export async function deletePackageService({ requestToken, params }: any) {
  const token: any = jwt.decode(requestToken);

  if (/kasir/.test(token.role)) {
    return {
      code: 401,
      message: 'anda bukan manajer atau admin',
    };
  }

  try {
    const existingPaket: any | null = await paket.findUnique({
      where: {
        id: params.paketId,
      },
      select: {
        id: true,
      },
    });

    if (!existingPaket) {
      return {
        code: 404,
        message: `paket dengan id ${params.paketId} tidak terdaftar`,
      };
    }

    await paket.delete({ where: { id: params.paketId }});

    return {
      code: 200,
      message: `paket dengan id ${params.paketId} berhasil di hapus`,
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

export async function getNamePackageService(requestToken: string) {
  const token: any = jwt.decode(requestToken);
  
  try {
    const existingOutlet = await user.findFirst({
      where: {
        id: token.id,
      },
      select: {
        id_outlet: true,
      },
    });
    
    const payload = await paket.findMany({
      where: {
        id_outlet: existingOutlet?.id_outlet,
      },
      select: {
        id: true,
        nama_paket: true,
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
