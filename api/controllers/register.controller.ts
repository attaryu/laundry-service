import type { Request, Response } from 'express';

import { createNewAccountService } from '../services/register.service.js';
import { serverErrorHandler } from '../lib/handlerReuse.js';

export async function registerController(req: Request, res: Response) {
  try {
    const payloads = await createNewAccountService(req.body);

    return res.status(payloads.code).json(payloads);
  } catch (message) {
    console.log(message);

    return serverErrorHandler(res);
  }
}
