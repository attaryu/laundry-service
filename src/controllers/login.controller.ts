import type { Request, Response } from 'express';

import {
  generateNewRequestTokenService,
  loginService,
  logoutService,
} from '../services/login.service.js';
import { serverErrorHandler } from '../lib/handlerReuse.js';

export async function loginController(req: Request, res: Response) {
  try {
    const payloads = await loginService(req.body);

    if (payloads.code !== 201) {
      return res.status(payloads.code).json({
        code: payloads.code,
        message: payloads.message,
      });
    }

    return res
      .status(payloads.code)
      .cookie('refresh-token', payloads.token.refreshToken, {
        httpOnly: true,
        maxAge: (24 * 60 * 60 * 1000) * 3,
      })
      .json({
        ...payloads,
        payload: payloads.payload,
        token: {
          requestToken: payloads.token.requestToken,
        },
      });
  } catch (message) {
    console.error(message);

    return serverErrorHandler(res);
  }
}

export async function generateNewRequestTokenController(req: Request, res: Response) {
  try {
    const payloads = await generateNewRequestTokenService(req.cookies['refresh-token']);

    return res.status(payloads.code).json(payloads);
  } catch (message) {
    console.error(message);

    return serverErrorHandler(res);
  }
}

export async function logoutUserController(req: Request, res: Response) {
  try {
    const payloads = await logoutService(req.cookies['refresh-token']);
    
    return res
      .status(payloads.code)
      .clearCookie('refresh-token')
      .json(payloads);
  } catch (message) {
    console.error(message);

    return serverErrorHandler(res);
  }
}
