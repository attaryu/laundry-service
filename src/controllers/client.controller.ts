import type { Request, Response } from 'express';

import { serverErrorHandler } from '../lib/handlerReuse.js';
import { verifyRequestToken } from '../lib/responseReuse.js';
import {
  createClientService,
  deleteClientService,
  editClientService,
  getAllClientService,
  getNameClientService,
  getSpecificClientService
} from '../services/client.service.js';

export async function createClientController(req: Request, res: Response) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }

  try {
    const payloads = await createClientService(<string>token, req.body);

    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }
}

export async function getAllClientController(req: Request, res: Response) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);
  
  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }
  
  try {
    const payloads = await getAllClientService(req.query);
  
    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }
}

export async function getSpecificClientController(req: Request, res: Response) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);
  
  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }
  
  try {
    const payloads = await getSpecificClientService(req.params);
  
    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }
}

export async function editClientController(req: Request, res: Response) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);
  
  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }
  
  try {
    const payloads = await editClientService(<string>token, req.body, req.params);
  
    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }
}

export async function deleteClientController(req: Request, res: Response) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }
  
  try {
    const payloads: any = await deleteClientService({
      requestToken: token,
      params: req.params,
    });
    
    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }  
}

export async function getNameClientController(req: Request, res: Response) {
  const token = req.headers.authorization?.split(' ')[1];
  const payloads = verifyRequestToken(token);

  if (payloads) {
    return res.status(payloads.code).json(payloads);
  }
  
  try {
    const payloads: any = await getNameClientService();
    
    return res.status(payloads.code).json(payloads);
  } catch (error) {
    console.error(error);
  
    return serverErrorHandler(res);
  }  
}
