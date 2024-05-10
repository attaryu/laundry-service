import type { Request, Response } from 'express';

import { serverErrorHandler } from '../lib/handlerReuse.js';
import { verifyRequestToken } from '../lib/responseReuse.js';
import {
  deleteUserService,
  editUserService,
  getAllUserService,
  getSpecificUserService,
} from '../services/user.service.js';

export async function getAllUserController(req: Request, res: Response) {
  const payloads = verifyRequestToken(req.headers.authorization?.split(' ')[1]);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }

  try {
    const payloads = await getAllUserService(req.query);

    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.log(error);

    return serverErrorHandler(res);
  }
}

export async function getSpecificUserController(req: Request, res: Response) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }

  try {
    const payloads: any = await getSpecificUserService(req.params);

    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);

    return serverErrorHandler(res);
  }
}

export async function editUserController(req: Request, res: Response) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }

  try {
    const payloads: any = await editUserService({
      requestToken: token,
      body: req.body,
      params: req.params,
    });

    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);

    return serverErrorHandler(res);
  }
}

export async function deleteSpecificUserController(req: Request, res: Response) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }

  try {
    const payloads: any = await deleteUserService({
      requestToken: token,
      params: req.params,
    });

    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);

    return serverErrorHandler(res);
  }
}
