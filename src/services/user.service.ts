import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { outlet, user } from '../models/index.js';
import propertyChecker from '../lib/propertyChecker.js';
import { serverError } from '../lib/responseReuse.js';

export async function getAllUserService(query: any) {
  try {
    const filter: any = {
      AND: [],
    };

    if (!query.page) {
      return {
        code: 400,
        message: 'query page harus tercantum',
      }
    }

    if (query.id_outlet) {
      filter.AND.push({
        id_outlet: query.id_outlet,
      })
    }

    if (query.role) {
      filter.AND.push({
        role: query.role,
      })
    }
    
    if (query.search) {
      filter.AND.push({
        OR: [
          {
            name: {
              search: query.search,
            }
          },
          {
            username: {
              search: query.search,
            }
          }
        ]
      });
    }
    
    const perPage = 10;
    const page = Number(query.page);
    const allList = await user.count();
    const payload = await user.findMany({
      where: filter,
      select: {
        name: true,
        username: true,
        role: true,
        tb_outlet: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
      take: perPage,
      skip: (perPage * page) - perPage,
    });

    if (payload.length === 0) {
      return {
        code: 404,
        message: 'data dengan hasil query tersebut tidak ada',
      }
    }

    return {
      code: 200,
      payload,
      page,
      per_page: perPage,
      all_page: Math.ceil(allList / 10),
      total: allList,
    }
  } catch (error) {
    console.error(error);

    return serverError()
  }
}

export async function getSpecificUserService(params: any) {
  try {
    const payload = await user.findUnique({
      where: {
        id: params.userId,
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        tb_outlet: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });

    if (!payload) {
      return {
        code: 404,
        message: `user dengan id ${params.userId} tidak terdaftar`
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

export async function editUserService({ requestToken, body, params }: any) {
  const token: any = jwt.decode(<string>requestToken);

  if (token.role === 'kasir' || token.role === 'owner') {
    return {
      code: 401,
      message: 'anda bukan admin',
    };
  }

  let propertyCorrection: any = propertyChecker(body, {
    name: 'string',
    username: 'string',
    role: 'string',
    id_outlet: 'string',
  });

  if (propertyCorrection) {
    return propertyCorrection;
  }

  if (propertyCorrection) {
    return propertyCorrection;
  }
  
  if (!/admin|owner|kasir/.test(body.role)) {
    return {
      code: 400,
      message: `role ${body.role} tidak tersedia`,
    }
  }

  try {
    const existingUser: any | null = await user.findUnique({
      where: {
        id: params.userId,
      },
      select: {
        id: true,
      },
    });
  
    if (!existingUser) {
      return {
        code: 404,
        message: `user dengan id ${params.userId} tidak terdaftar`,
      };
    }
      
    const existingOutlet: { id: string } | null = await outlet.findUnique({
      where: {
        id: body.id_outlet,
      },
      select: {
        id: true,
      },
    })

    if (!existingOutlet) {
      return {
        code: 400,
        message: `outlet dengan id ${body.id_outlet} tidak terdaftar`,
      }
    }
    
    let updateRecord: any = {
      name: body.name,
      username: body.username,
      id_outlet: body.id_outlet,
      role: body.role,
    }

    if (body.password) {
      updateRecord = {
        ...updateRecord,
        password: await bcrypt.hash(body.password, 10),
      };
    }
    
    const payload = await user.update({
      where: {
        id: params.userId,
      },
      data: updateRecord,
      select: {
        id: true,
        name: true,
      },
    });

    return {
      code: 200,
      message: `user dengan id ${payload.id} sudah di update`,
    };
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

export async function deleteMultipleUserService({ requestToken, body }: any) {
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
    const deletedUser = await user.deleteMany({
      where: {
        id: {
          in: body.id,
        }
      }
    })

    if (!deletedUser.count) {
      return {
        code: 404,
        message: `user dengan id ${body.id.join(', ')} tidak terdaftar`,
      }
    }

    return {
      code: 200,
      message: `user dengan id ${body.id.join(', ')} berhasil dihapus`,
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

export async function deleteUserService({ requestToken, params }: any) {
  const token: any = jwt.decode(<string>requestToken);

  if (token.role === 'kasir' || token.role === 'owner') {
    return {
      code: 401,
      message: 'anda bukan admin',
    };
  }

  if (token.id === params.userId) {
    return {
      code: 400,
      message: 'tidak bisa menghapus akun sendiri',
    };
  }

  try {
    const existingUser = await user.findUnique({ where: { id: params.userId }});

    if (!existingUser) {
      return {
        code: 404,
        message: `user dengan id ${params.userId} tidak ditemukan`,
      };
    }

    await user.delete({ where: { id: params.userId }});
    
    return {
      code: 200,
      message: `user dengan id ${params.userId} berhasil dihapus`,
    };
  } catch (error) {
    console.error(error);

    return serverError();
  }
}
