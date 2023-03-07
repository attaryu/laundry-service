import express from 'express';

import { graphController } from '../controllers/graph.controller.js';
import { methodNotAllowed } from '../lib/handlerReuse.js';

const logRouter = express.Router();

logRouter.route('/graph')
  .get(graphController)
  .all(methodNotAllowed);

export default logRouter;
