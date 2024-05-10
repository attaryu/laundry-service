import type { Request, Response } from 'express';

import { serverErrorHandler } from '../lib/handlerReuse.js';
import { verifyRequestToken } from '../lib/responseReuse.js';
import {
  generateTransactionReportService
} from '../services/report.service.js';

export async function generateTransactionReportController(req: Request, res: Response) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }

  try {
    const payloads: any = await generateTransactionReportService({
      requestToken: <string>token,
      query: <any>req.query,
    });

    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }
}