import express from 'express';

import {
  createPackageController,
  deletePackageController,
  editPackageController,
  getAllPackageController,
} from '../controllers/package.controller.js';
import { methodNotAllowed } from '../lib/handlerReuse.js';

const packageRouter = express.Router();

packageRouter.route('/package')
  .get(getAllPackageController)
  .post(createPackageController)
  .all(methodNotAllowed);

packageRouter.route('/package/:paketId')
  .post(editPackageController)
  .delete(deletePackageController)
  .all(methodNotAllowed);

export default packageRouter;
