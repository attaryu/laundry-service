const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const propertyChecker = require('../lib/propertyChecker');
const { serverError } = require('../lib/responseReuse');
const { logUser, outlet, user } = require('../models');

async function getAllUserService(query) {
  try {
    const filter = {
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
              contains: query.search,
            }
          },
          {
            username: {
              contains: query.search,
            }
          }
        ]
      });
    }

    const perPage = 10;
    const page = Number(query.page);
    const allData = await user.count();
    const allPage = Math.ceil(allData / perPage);
    const payload = await user.findMany({
      where: filter,
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        id_outlet: true,
        tb_outlet: {
          select: {
            nama: true,
          }
        }
      },
      take: perPage,
      skip: (perPage * page) - perPage,
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

    return serverError()
  }
}

async function getSpecificUserService(params) {
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
            alamat: true,
            telepon: true,
          },
        },
        tb_transaksi: {
          orderBy: {
            tanggal: 'desc'
          },
          take: 3,
          select: {
            id: true,
            total: true,
            kode_invoice: true,
            tanggal: true,
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

async function editUserService({ requestToken, body, params }) {
  const token = jwt.decode(requestToken);

  if (/manajer|kasir/.test(token.role)) {
    return {
      code: 401,
      message: 'anda bukan admin',
    };
  }

  let propertyCorrection = propertyChecker(body, {
    name: 'string',
    username: 'string',
    role: 'string',
    id_outlet: 'string',
  });

  if (propertyCorrection) {
    return propertyCorrection;
  }

  if (/[^manajer|kasir]/.test(body.role)) {
    return {
      code: 400,
      message: `role ${body.role} tidak tersedia`,
    }
  }

  try {
    const existingUser = await user.findUnique({
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

    const existingOutlet = await outlet.findUnique({
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

    let updateRecord = {
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
        username: true,
        role: true,
        id_outlet: true,
      },
    });

    await logUser.create({
      data: {
        action: 'edit',
        id_user: payload.id,
      }
    })

    return {
      code: 200,
      message: `user dengan id ${payload.id} sudah di update`,
      payload,
    };
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

async function deleteUserService({ requestToken, params }) {
  const token = jwt.decode(requestToken);

  if (/manajer|kasir/.test(token.role)) {
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
    const existingUser = await user.findUnique({ where: { id: params.userId } });

    if (!existingUser) {
      return {
        code: 404,
        message: `user dengan id ${params.userId} tidak ditemukan`,
      };
    }

    await user.delete({ where: { id: params.userId } });
    await logUser.create({
      data: {
        id_user: params.userId,
        action: 'hapus',
      }
    })

    return {
      code: 200,
      message: `user dengan id ${params.userId} berhasil dihapus`,
    };
  } catch (error) {
    console.error(error);

    return serverError();
  }
}

module.exports = {
  getAllUserService,
  getSpecificUserService,
  editUserService,
  deleteUserService,
}
