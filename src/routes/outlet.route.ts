import express from 'express';

import {
  createOutletController,
  deleteMultipleOutletController,
  deleteOutletController,
  editOutletController,
  getAllOutletController,
  getSpecificOutletController,
} from '../controllers/outlet.controller.js';
import { methodNotAllowed } from '../lib/handlerReuse.js';

const registerRouter = express.Router();

registerRouter.route('/outlet')
  .post(createOutletController)
  .get(getAllOutletController)
  .delete(deleteMultipleOutletController)
  .all(methodNotAllowed);
  
  registerRouter.route('/outlet/:userId')
  .get(getSpecificOutletController)
  .put(editOutletController)
  .delete(deleteOutletController)
  .all(methodNotAllowed);

export default registerRouter;
