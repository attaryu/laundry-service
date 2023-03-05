import express from 'express';

import {
  archiveEmailController,
  cancelEmailController,
  createEmailController,
  getAllEmailController,
  getSpecificEmailController,
  readEmailController,
} from '../controllers/email.controller.js';
import { methodNotAllowed } from '../lib/handlerReuse.js';

const emailRouter = express.Router();

emailRouter.route('/email')
  .get(getAllEmailController)
  .post(createEmailController)
  .all(methodNotAllowed);
  
emailRouter.route('/email/:emailId')
  .get(getSpecificEmailController)
  .delete(cancelEmailController)
  .all(methodNotAllowed);

emailRouter.route('/email/:emailId/archive/:archive')
  .put(archiveEmailController)
  .all(methodNotAllowed);

emailRouter.route('/email/:emailId/read/:reader')
  .put(readEmailController)
  .all(methodNotAllowed);

export default emailRouter;
