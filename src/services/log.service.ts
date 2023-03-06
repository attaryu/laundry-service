import jwt from 'jsonwebtoken';

import {
  logOutlet,
  logPelanggan,
  logSurat,
  logTransaksi,
  logUser,
} from '../models/index.js';
import { serverError } from '../lib/responseReuse.js';

export async function getAllLogService(requestToken: string) {
  const token: any = jwt.decode(requestToken);

  if (/manajer|kasir/.test(token.role)) {
    return {
      code: 401,
      message: 'anda bukan admin',
    }
  }

  try {
    const outlet = await logOutlet.findMany({ take: 20 });
    const customer = await logPelanggan.findMany({ take: 20 });
    const email = await logSurat.findMany({ take: 20 });
    const transaction = await logTransaksi.findMany({ take: 20 });
    const user = await logUser.findMany({ take: 20 });

    const allLog = [
      ...outlet,
      ...customer,
      ...email,
      ...transaction,
      ...user,
    ].sort((a, b) => new Date(b.dateNow).getTime() - new Date(a.dateNow).getTime());

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
