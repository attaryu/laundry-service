const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { logUser, user, userAuth } = require('../models/index');
const propertyChecker = require('../lib/propertyChecker');
const { serverError, tokenError } = require('../lib/responseReuse');

async function loginService(body) {
  let propertyCorrection = propertyChecker(body, {
    username: 'string',
    password: 'string',
  });

  if (propertyCorrection) {
    return propertyCorrection;
  }

  try {
    const existingUser = await user.findUnique({
      where: { username: body.username },
      select: {
        id: true,
        name: true,
        username: true,
        password: true,
        role: true,
        id_outlet: true,
      },
    });

    if (!existingUser) {
      return {
        code: 404,
        message: `User dengan username ${body.username} tidak terdaftar`,
      };
    }

    const match = await bcrypt.compare(body.password, existingUser.password);

    if (!match) {
      return {
        code: 400,
        message: 'Password salah',
      };
    }

    const requestToken = jwt.sign({
      id: existingUser.id,
      username: existingUser.username,
      role: existingUser.role,
    }, process.env.REQUEST_SECRET_KEY, {
      expiresIn: '7d',
    });

    const refreshToken = jwt.sign({
      id: existingUser.id,
    }, process.env.REFRESH_SECRET_KEY, {
      expiresIn: '3d',
    });

    await userAuth.upsert({
      where: {
        id_user: existingUser.id
      },
      update: {
        refresh_token: refreshToken,
      },
      create: {
        refresh_token: refreshToken,
        id_user: existingUser.id
      },
    });

    await logUser.create({
      data: {
        action: 'login',
        id_user: existingUser.id,
      }
    })

    return {
      code: 201,
      message: 'Login berhasil',
      payload: {
        id: existingUser.id,
        name: existingUser.name,
        username: existingUser.username,
        role: existingUser.role,
        id_outlet: existingUser.id_outlet,
      },
      token: {
        refreshToken,
        requestToken,
      }
    };
  } catch (message) {
    console.error(message);

    return serverError();
  }
}

async function generateNewRequestTokenService() {
  try {
    const requestToken = jwt.sign({
      id: existingRefreshToken.tb_user.id,
      username: existingRefreshToken.tb_user.username,
      role: existingRefreshToken.tb_user.role,
    }, process.env.REQUEST_SECRET_KEY, {
      expiresIn: '7d',
    });

    return {
      code: 201,
      message: 'request token berhasil di perbarui',
      payload: {
        user: { ...existingRefreshToken.tb_user },
        request_token: requestToken,
      }
    }
  } catch (message) {
    console.error(message);

    return serverError();
  }
}

async function logoutService(refreshToken) {
  try {
    await logUser.create({
      data: {
        action: 'logout',
        id_user: payload.tb_user.id,
      }
    })

    return {
      code: 200,
      message: 'logout berhasil',
    }
  } catch (message) {
    console.error(message);

    return serverError();
  }
}

module.exports = {
  loginService,
  generateNewRequestTokenService,
  logoutService,
}
