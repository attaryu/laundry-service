import jwt from 'jsonwebtoken';

import { serverError } from '../lib/responseReuse.js';
import {
  logTransaksi
} from '../models/index.js';

export async function getAllLogService(requestToken: string) {
  const token: any = jwt.decode(requestToken);

  if (/manajer|kasir/.test(token.role)) {
    return {
      code: 401,
      message: 'anda bukan admin',
    }
  }

  try {
    const transaction = await logTransaksi.findMany({ take: 30, orderBy: { dateNow: 'desc' } });

    return {
      code: 200,
      message: 'success',
      payload: transaction,
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}
