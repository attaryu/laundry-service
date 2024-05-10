import jwt from 'jsonwebtoken';

export const serverError = () => ({
  code: 500,
  message: 'server error, coba lagi nanti',
})

export function tokenError(name: string, isRequest = false) {
  const typeToken = isRequest ? 'request' : 'refresh';
  
  switch (name) {
    case 'TokenExpiredError':
      return {
        code: 401,
        message: `${typeToken} token kedaluwarsa, silahkan login kembali`,
      };
    case 'JsonWebTokenError':
      return {
        code: 401,
        message: `${typeToken} token tidak valid, silahkan login kembali`,
      };
    case 'NotBeforeError':
      return {
        code: 401,
        message: `${typeToken} token sudah tidak aktif, silahkan login kembali`,
      };
    default:
      return serverError();
  }
}

export function verifyRequestToken(requestToken: string | null | undefined) {
  if (typeof requestToken !== 'string') {
    return {
      code: 400,
      message: 'request token harus di cantumkan di headers',
    };
  }

  try {
    jwt.verify(requestToken, <string>process.env.REQUEST_SECRET_KEY);
  } catch (error: any) {
    console.error(error);

    if ('name' in error) {
      return tokenError(error.name, true);
    }

    return serverError();
  }

  return false;
}
