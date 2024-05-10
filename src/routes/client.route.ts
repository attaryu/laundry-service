import express from 'express';

import {
  createClientController,
  deleteClientController,
  editClientController,
  getAllClientController,
  getNameClientController,
  getSpecificClientController
} from '../controllers/client.controller.js';
import { methodNotAllowed } from '../lib/handlerReuse.js';

const clientRouter = express.Router();

clientRouter.route('/customer')
  .post(createClientController)
  .get(getAllClientController)
  .all(methodNotAllowed);
  
clientRouter.route('/customer/name')
  .get(getNameClientController)
  .all(methodNotAllowed);
  
clientRouter.route('/customer/:customerId')
  .get(getSpecificClientController)
  .put(editClientController)
  .delete(deleteClientController)
  .all(methodNotAllowed);

export default clientRouter;
