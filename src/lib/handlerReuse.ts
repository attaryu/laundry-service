import type { Request, Response } from 'express';

export function methodNotAllowed(req: Request, res: Response) {
  return res.status(405).send(`method ${req.method} tidak tersedia di endpoint ${req.path}`);
}

export function serverErrorHandler(res: Response) {
  return res.status(505).json({
    code: 500,
    message: `server error, silahkan coba lagi nanti`,
  });
}
