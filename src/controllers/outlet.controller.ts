import type { Request, Response } from 'express';

import { serverErrorHandler } from '../lib/handlerReuse.js';
import { verifyRequestToken } from '../lib/responseReuse.js';
import {
  createOutletService,
  deleteOutletService,
  editOutletService,
  getAllOutletService,
  getSpecificOutletService,
  getNameOutletService,
} from '../services/outlet.service.js';

export async function createOutletController(req: Request, res: Response) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }

  try {
    const payloads = await createOutletService(<string>token, req.body);

    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }
}

export async function getAllOutletController(req: Request, res: Response) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);
  
  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }
  
  try {
    const payloads = await getAllOutletService(req.query);
  
    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }
}

export async function getSpecificOutletController(req: Request, res: Response) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);
  
  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }
  
  try {
    const payloads = await getSpecificOutletService(req.params);
  
    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }
}

export async function editOutletController(req: Request, res: Response) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);
  
  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }
  
  try {
    const payloads = await editOutletService(<string>token, req.body, req.params);
  
    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }
}

export async function deleteOutletController(req: Request, res: Response) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }
  
  try {
    const payloads: any = await deleteOutletService({
      requestToken: token,
      params: req.params,
    });
    
    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }  
}

export async function getNameOutletController(req: Request, res: Response) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }
  
  try {
    const payloads: any = await getNameOutletService();
    
    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }  
}
