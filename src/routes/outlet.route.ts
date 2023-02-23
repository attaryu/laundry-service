import express from 'express';

import {
  createOutletController,
  deleteOutletController,
  editOutletController,
  getAllOutletController,
  getSpecificOutletController
} from '../controllers/outlet.controller.js';
import { methodNotAllowed } from '../lib/handlerReuse.js';

const outletRouter = express.Router();

outletRouter.route('/outlet')
  .post(createOutletController)
  .get(getAllOutletController)
  .all(methodNotAllowed);
  
outletRouter.route('/outlet/:outletId')
  .get(getSpecificOutletController)
  .put(editOutletController)
  .delete(deleteOutletController)
  .all(methodNotAllowed);

export default outletRouter;
