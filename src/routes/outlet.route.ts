import express from 'express';

import {
  createOutletController,
  deleteOutletController,
  editOutletController,
  getAllOutletController,
  getSpecificOutletController,
  getNameOutletController,
} from '../controllers/outlet.controller.js';
import { methodNotAllowed } from '../lib/handlerReuse.js';

const outletRouter = express.Router();

outletRouter.route('/outlet/nama')
  .get(getNameOutletController)
  .all(methodNotAllowed);

outletRouter.route('/outlet/:outletId')
  .get(getSpecificOutletController)
  .put(editOutletController)
  .delete(deleteOutletController)
  .all(methodNotAllowed);

outletRouter.route('/outlet')
  .post(createOutletController)
  .get(getAllOutletController)
  .all(methodNotAllowed);
  
  

export default outletRouter;
