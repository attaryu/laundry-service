const { hash } = require('bcrypt');

const { logUser, outlet, user } = require('../models');
const propertyChecker = require('../lib/propertyChecker');
const nanoid = require('../lib/customNanoid');

async function createNewAccountService(body) {
  let propertyCorrection = propertyChecker(body, {
    name: 'string',
    username: 'string',
    password: 'string',
    repeatPassword: 'string',
    role: 'string',
    id_outlet: 'string',
  });

  if (propertyCorrection) {
    return propertyCorrection;
  }
  
  if (body.password !== body.repeatPassword) {
    return {
      code: 400,
      message: 'password tidak sama',
    };
  }

  if (/[^admin|manajer|kasir]/.test(body.role)) {
    return {
      code: 400,
      message: `role ${body.role} tidak tersedia`,
    }
  }
  
  try {
    const existingOutlet = await outlet.findFirst({
      where: {
        id: body.id_outlet,
      }
    })
  
    if (!existingOutlet) {
      return {
        code: 400,
        message: `outlet dengan id ${body.id_outlet} tidak terdaftar`,
      }
    }
  
    const existingUser = await user.findFirst({
      where: {
        OR: [
          {
            username: body.username,
          },
          {
            name: body.name,
          },
        ]
      },
      select: {
        name: true,
        username: true,
      },
    });
  
    if (existingUser) {
      if (existingUser.name === body.name) {
        return {
          code: 400,
          message: `user dengan nama ${existingUser.name} sudah terdaftar`,
        };
      } else {
        return {
          code: 400,
          message: `user dengan username ${existingUser.username} sudah terdaftar`,
        };
      }
    }

    const createdUser = await user.create({
      data: {
        id: nanoid(),
        password: await hash(body.password, 10),
        name: body.name,
        username: body.username,
        role: body.role,
        id_outlet: body.id_outlet,
      },
      select: { id: true },
    });

    await logUser.create({
      data: {
        action: 'daftar',
        id_user: createdUser.id,
      }
    })
    
    return {
      code: 201,
      message: 'berhasil daftar, silahkan login',
      payload: {
        id: createdUser.id,
      },
    };
  } catch (message) {
    console.log(message);

    return {
      code: 500,
      message: 'server error, coba lagi nanti',
    };
  }
}

module.exports = { createNewAccountService }
