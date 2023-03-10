import express from 'express';

import {
  graphController,
  totalDataController,
  incomeController,
} from '../controllers/analytic.controller.js';
import { methodNotAllowed } from '../lib/handlerReuse.js';

const analyticRouter = express.Router();

analyticRouter
  .route('/analytic/transaction/graph')
  .get(graphController)
  .all(methodNotAllowed);

analyticRouter.route('/analytic/total-data')
  .get(totalDataController)
  .all(methodNotAllowed);

analyticRouter.route('/analytic/income')
  .get(incomeController)
  .all(methodNotAllowed);

export default analyticRouter;
