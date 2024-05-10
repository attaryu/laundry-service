import type { Request, Response } from 'express';

import { serverErrorHandler } from '../lib/handlerReuse.js';
import { verifyRequestToken } from '../lib/responseReuse.js';
import { graphService, totalDataService, incomeService } from '../services/analytic.service.js';

export async function graphController(req: Request, res: Response) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }

  try {
    const payloads: any = await graphService(<string>token);

    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);

    return serverErrorHandler(res);
  }
}

export async function totalDataController(req: Request, res: Response) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }

  try {
    const payloads: any = await totalDataService(<string>token);

    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);

    return serverErrorHandler(res);
  }
}

export async function incomeController(req: Request, res: Response) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }

  try {
    const payloads: any = await incomeService(<string>token, req.query);

    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);

    return serverErrorHandler(res);
  }
}