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
    const transaction = await logTransaksi.findMany({ take: 30 });

    const allLog = transaction.sort((a, b) => new Date(b.dateNow).getTime() - new Date(a.dateNow).getTime());

    return {
      code: 200,
      message: 'success',
      payload: allLog,
    }
  } catch (error) {
    console.error(error);

    return serverError();
  }
}
