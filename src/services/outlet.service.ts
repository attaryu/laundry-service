import jwt from 'jsonwebtoken';

import nanoid from '../lib/customNanoid.js';
import propertyChecker from '../lib/propertyChecker.js';
import { serverError } from '../lib/responseReuse.js';
import { outlet } from '../models/index.js';

export async function createOutletService(requestToken: string, body: any) {
  const token: any = jwt.decode(requestToken);

  if (token.role === 'kasir' || token.role === 'owner') {
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
        id: `outlet-${nanoid()}`,
        nama: body.nama,
        alamat: body.alamat,
        telepon: body.telepon,
      },
      select: { id: true },
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

  if (query.search) {
    filter = {
      OR: [
        {
          nama: {
            search: query.search,
          },
        },
        {
          alamat: {
            search: query.search,
          },
        },
        {
          telepon: {
            search: query.search,
          },
        }
      ]
    };
  }

  try {
    const payload = await outlet.findMany({
      where: filter,
      select: {
        nama: true,
        alamat: true,
        telepon: true,
      },
    });

    if (payload.length === 0) {
      return {
        code: 404,
        message: `pencarian ${query.search} tidak ditemukan`,
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

export async function getSpecificOutletService(params: any) {
  try {
    const specificOutlet = await outlet.findUnique({
      where: {
        id: params.outletId,
      },
      select: {
        id: true,
      },
    });

    if (!specificOutlet) {
      return {
        code: 404,
        message: `outlet dengan id ${params.outletId} tidak ditemukan`,
      };
    }
    
    return {
      code: 200,
      payload: {
        ...specificOutlet,
      }
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

export async function editOutletService(requestToken: string, body: any, params: any) {
  const token: any = jwt.decode(requestToken);

  if (token.role === 'kasir' || token.role === 'owner') {
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
    
    const payload = await outlet.update({
      where: {
        id: params.userId,
      },
      data: {
        nama: body.nama,
        alamat: body.alamat,
        telepon: body.telepon,
      },
      select: { id: true },
    })

    return {
      code: 200,
      message: 'outlet berhasil di edit',
      payload
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

export async function deleteMultipleOutletService({ requestToken, body }: any) {
  const token: any = jwt.decode(<string>requestToken);

  if (token.role === 'kasir' || token.role === 'owner') {
    return {
      code: 401,
      message: 'anda bukan admin',
    };
  }

  const propertyCorrection: any = propertyChecker(body, { id: 'array' });

  if (propertyCorrection) {
    return propertyCorrection;
  }

  try {
    const payloads = await outlet.deleteMany({
      where: {
        id: {
          in: body.id,
        }
      }
    })

    if (!payloads.count) {
      return {
        code: 404,
        message: `outlet dengan id ${body.id.join(', ')} tidak ditemukan`,
      }
    }

    return {
      code: 200,
      message: `outlet dengan id ${body.id.join(', ')} berhasil dihapus`,
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

export async function deleleteOutletService({ requestToken, params }: any) {
  const token: any = jwt.decode(requestToken);

  if (token.role === 'kasir' || token.role === 'owner') {
    return {
      code: 401,
      message: 'anda bukan admin',
    };
  }

  try {
    const existingOutlet: any | null = await outlet.findFirst({
      where: {
        id: params.userId,
      },
      select: {
        id: true,
      },
    });

    if (!existingOutlet) {
      return {
        code: 404,
        message: `outlet dengan id ${params.id} tidak terdaftar`,
      };
    }

    await outlet.delete({ where: { id: params.userId }});

    return {
      code: 200,
      message: 'outlet berhasil di hapus',
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}
