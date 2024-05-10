import express from 'express';

import {
  getAllLogController,
} from '../controllers/log.controller.js';
import { methodNotAllowed } from '../lib/handlerReuse.js';

const logRouter = express.Router();

logRouter.route('/log')
  .get(getAllLogController)
  .all(methodNotAllowed);

export default logRouter;
