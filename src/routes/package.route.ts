import express from 'express';

import {
  createPackageController,
  deletePackageController,
  editPackageController,
  getAllPackageController,
  getSpecificPackageController,
  getNamePackageController,
} from '../controllers/package.controller.js';
import { methodNotAllowed } from '../lib/handlerReuse.js';

const packageRouter = express.Router();

packageRouter.route('/package/name')
  .get(getNamePackageController)
  .all(methodNotAllowed);

packageRouter.route('/package/:paketId')
  .get(getSpecificPackageController)
  .put(editPackageController)
  .delete(deletePackageController)
  .all(methodNotAllowed);


packageRouter.route('/package')
  .get(getAllPackageController)
  .post(createPackageController)
  .all(methodNotAllowed);

export default packageRouter;
