import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { logUser, user, userAuth } from '../models/index.js';
import propertyChecker from '../lib/propertyChecker.js';
import { serverError, tokenError } from '../lib/responseReuse.js';

export async function loginService(body: any) {
  let propertyCorrection: any = propertyChecker(body, {
    username: 'string',
    password: 'string',
  });

  if (propertyCorrection) {
    return propertyCorrection;
  }

  try {
    const existingUser: ExistingUser | null = await user.findUnique({
      where: { username: body.username },
      select: {
        id: true,
        name: true,
        username: true,
        password: true,
        role: true,
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
    }, <string>process.env.REQUEST_SECRET_KEY, {
      expiresIn: '1m',
    });

    const refreshToken = jwt.sign({
      id: existingUser.id,
    }, <string>process.env.REFRESH_SECRET_KEY, {
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

interface ExistingUser {
  id: string,
  name: string,
  username: string,
  password: string,
  role: string,
}

export async function generateNewRequestTokenService(refreshToken: string) {
  try {
    jwt.verify(refreshToken, <string>process.env.REFRESH_SECRET_KEY);
  } catch (error: any) {
    if ('name' in error) {
      return tokenError(error.name)
    }

    return serverError()
  }

  try {
    const existingRefreshToken: ExistingRefreshToken | null = await userAuth.findUnique({
      where: {
        refresh_token: refreshToken,
      },
      select: {
        refresh_token: true,
        tb_user: {
          select: {
            id: true,
            name: true,
            username: true,
            id_outlet: true,
            role: true,
          }
        }
      }
    });

    if (!existingRefreshToken) {
      return {
        code: 400,
        message: 'refresh token tidak terdaftar, silahkan login',
      }
    }

    const requestToken = jwt.sign({
      id: existingRefreshToken.tb_user.id,
      username: existingRefreshToken.tb_user.username,
      role: existingRefreshToken.tb_user.role,
    }, <string>process.env.REQUEST_SECRET_KEY, {
      expiresIn: '1m',
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

export async function logoutService(refreshToken: string) {
  try {
    jwt.verify(refreshToken, <string>process.env.REFRESH_SECRET_KEY);
  } catch (error: any) {
    console.error(error);

    if ('name' in error) {
      return tokenError(error.name);
    }

    return serverError();
  }

  try {
    const existingRefreshToken = await userAuth.findFirst({
      where: {
        refresh_token: refreshToken,
      }
    });
    
    if (!existingRefreshToken) {
      return {
        code: 404,
        message: 'refresh token tidak terdaftar',
      }
    }
    
    const payload = await userAuth.delete({
      where: {
        refresh_token: refreshToken,
      },
      select: {
        tb_user: {
          select: {
            id: true,
          },
        },
      },
    });

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

interface ExistingRefreshToken {
  refresh_token: string,
  tb_user: {
    id: string,
    name: string
    username: string,
    role: string,
  },
}
